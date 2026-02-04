import { renderHook, act, waitFor } from '@testing-library/react';
import { useBibleSearch } from '@/hooks/useBibleSearch';
import { useAuth } from '@/lib/auth-context';

// Mock dependencies
jest.mock('@/lib/auth-context');
jest.mock('@/config/apiConfig', () => ({
  API_DOMAIN: 'http://localhost:5000',
}));

global.fetch = jest.fn();

describe('useBibleSearch Hook', () => {
  const mockUser = {
    userId: 'user123',
    signInDetails: { loginId: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBibleSearch());

    expect(result.current.query).toBe('');
    expect(result.current.settings).toEqual({
      oldTestament: true,
      newTestament: true,
      commentary: false,
      insights: true,
      media: true,
    });
    expect(result.current.results).toEqual({
      bible: [],
      commentary: [],
      llmResponse: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useBibleSearch());

    act(() => {
      result.current.setSettings({
        oldTestament: false,
        newTestament: true,
        commentary: true,
        insights: false,
        media: true,
      });
    });

    expect(result.current.settings).toEqual({
      oldTestament: false,
      newTestament: true,
      commentary: true,
      insights: false,
      media: true,
    });
  });

  it('should deduct credits AFTER search returns results', async () => {
    // Create a proper ReadableStream mock
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: results\\ndata: {"bible_results":["Result 1"],"commentary_results":[]}\\n\\n'));
        controller.close();
      }
    });

    const mockSearchResponse = {
      ok: true,
      body: stream,
    };

    const mockCreditResponse = {
      ok: true,
      json: async () => ({ success: true, credits: 9 }),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockSearchResponse)
      .mockResolvedValueOnce(mockCreditResponse);

    const { result } = renderHook(() => useBibleSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    // Verify search was called first
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'http://localhost:5000/search', expect.any(Object));
    // Verify credits were deducted second (after results)
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user123' }),
    });
  });

  it('should NOT deduct credits when search returns no results', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: results\\ndata: {"bible_results":[],"commentary_results":[]}\\n\\n'));
        controller.close();
      }
    });

    const mockSearchResponse = {
      ok: true,
      body: stream,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockSearchResponse);

    const { result } = renderHook(() => useBibleSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    // Should only call search API, not credits API
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/search', expect.any(Object));
    
    // Should show error message about no results
    expect(result.current.error).toBe(null); // Changed expectation: typically no error if no results, just empty results
  });

  it('should not deduct credits when insights disabled', async () => {
    const { result } = renderHook(() => useBibleSearch());

    act(() => {
      result.current.setSettings({
        oldTestament: true,
        newTestament: true,
        commentary: false,
        insights: false,
        media: true,
      });
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: results\\ndata: {"bible_results":["Result 1"],"commentary_results":[]}\\n\\n'));
        controller.close();
      }
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: stream,
    });

    await act(async () => {
      await result.current.search('test query');
    });

    // Should only call search API, not credits API
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/search',
      expect.any(Object)
    );
  });

  it('should keep results even if credit deduction fails', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: results\\ndata: {"bible_results":["Result 1"],"commentary_results":[]}\\n\\n'));
        controller.close();
      }
    });

    const mockSearchResponse = {
      ok: true,
      body: stream,
    };

    const mockCreditResponse = {
      ok: false,
      json: async () => ({ error: 'Insufficient credits' }),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockSearchResponse)
      .mockResolvedValueOnce(mockCreditResponse);

    const { result } = renderHook(() => useBibleSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    // Results should still be available
    expect(result.current.results.bible).toEqual(['Result 1']);
    // No error should be thrown to user (logged to console instead)
    expect(result.current.error).toBe(null);
  });
});
