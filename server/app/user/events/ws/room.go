package ws

type Room struct {
	RoomId     string                `json:"roomId"`
	RoomName   string                `json:"roomName"`
	WsServices map[string]*WsService `json:"clients"`
}
