package ws

type Message struct {
	MessageTxt string `json:"messageTxt"`
	ClientId   string `json:"clientId"`
	RoomId     string `json:"roomId"`
	Username   string `json:"username"`
}
