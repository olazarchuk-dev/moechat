package ws

type Room struct {
	RoomId   string                       `json:"roomId"`
	RoomName string                       `json:"roomName"`
	Clients  map[string]*WebsocketService `json:"clients"`
}
