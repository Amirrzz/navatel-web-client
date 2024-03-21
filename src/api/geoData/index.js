import axios from "axios";

export const getDataFromIp = () => {
  return axios
    .get("https://api.ipregistry.co/?key=tryout")
    .then((res) => res.data);
};
