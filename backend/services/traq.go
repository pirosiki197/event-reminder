package services

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/motoki317/sc"
	"github.com/traPtitech/go-traq"
)

type TraQService struct {
	client           *traq.APIClient
	channelListCache *sc.Cache[struct{}, []TraQChannel]
}

func NewTraQService(client *traq.APIClient) *TraQService {
	s := &TraQService{
		client: client,
	}
	s.channelListCache = sc.NewMust(s.getChannelList, 5*time.Minute, 10*time.Minute)
	return s
}

type TraQChannel struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (s *TraQService) GetChannelList(ctx context.Context) ([]TraQChannel, error) {
	return s.channelListCache.Get(ctx, struct{}{})
}

func (s *TraQService) getChannelList(ctx context.Context, _ struct{}) ([]TraQChannel, error) {
	allChannels, _, err := s.client.ChannelApi.GetChannels(ctx).Execute()
	if err != nil {
		return nil, err
	}
	channels := slices.DeleteFunc(allChannels.Public, func(c traq.Channel) bool { return c.Archived })

	channelByID := make(map[string]traq.Channel, len(channels))
	for _, c := range channels {
		channelByID[c.Id] = c
	}

	rootChannels := make([]traq.Channel, 0)
	for _, c := range channels {
		if c.ParentId.Get() == nil {
			rootChannels = append(rootChannels, c)
		}
	}

	res := make([]TraQChannel, 0, len(channels))
	for _, r := range rootChannels {
		res = append(res, TraQChannel{
			ID:   r.Id,
			Name: r.Name,
		})
		buildChannelList(r, r.Name, channelByID, &res)
	}

	return res, nil
}

func buildChannelList(parent traq.Channel, path string, channelByID map[string]traq.Channel, res *[]TraQChannel) {
	for _, cid := range parent.Children {
		channel, ok := channelByID[cid]
		if !ok {
			continue
		}
		newPath := fmt.Sprintf("%s/%s", path, channel.Name)
		*res = append(*res, TraQChannel{
			ID:   channel.Id,
			Name: newPath,
		})
		buildChannelList(channel, newPath, channelByID, res)
	}
}
