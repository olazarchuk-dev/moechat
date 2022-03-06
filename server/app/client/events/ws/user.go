package ws

type User struct {
	UserId     string                `json:"userId"`
	UserName   string                `json:"userName"`
	WsServices map[string]*WsService `json:"wsServices"`
}
