package ws

type Message struct {
	MessageTxt   string `json:"messageTxt"`
	MessageState int    `json:"messageState"`
	ClientId     string `json:"clientId"`
	UserId       string `json:"userId"`
	Username     string `json:"username"`
}
