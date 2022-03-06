package ws

type User struct {
	UserId     string                `json:"userId"`
	RoomName   string                `json:"roomName"`
	WsServices map[string]*WsService `json:"wsServices"`
}
