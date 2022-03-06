package ws

type Something struct {
	ClientId     string `json:"clientId"`
	UserId       string `json:"userId"`
	Username     string `json:"username"`
	MessageTxt   string `json:"messageTxt"`
	MessageState int    `json:"messageState"`
}
