package ws

type Something struct { // TODO: init dynamic data
	Id          string `json:"id"`
	Username    string `json:"username"`
	DeviceName  string `json:"deviceName"`
	AppTextarea string `json:"appTextarea"`
	AppRange    int    `json:"appRange"`
}
