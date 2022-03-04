package ws

type Message struct {
	MessageTxt   string `json:"messageTxt"`
	MessageState int    `json:"messageState"`
	ClientId     string `json:"clientId"`
	RoomId       string `json:"roomId"`
	Username     string `json:"username"`
}
