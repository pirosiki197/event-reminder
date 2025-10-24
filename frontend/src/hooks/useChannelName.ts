import { useAppStore } from '../store';

/**
 * チャンネルIDからチャンネル名を取得するカスタムフック
 * @param channelId - TraQチャンネルID
 * @returns チャンネル名（見つからない場合はIDをそのまま返す）
 */
export const useChannelName = (channelId: string): string => {
  const { traQChannels } = useAppStore();

  const channel = traQChannels.find((c) => c.id === channelId);
  return channel?.name || channelId;
};
