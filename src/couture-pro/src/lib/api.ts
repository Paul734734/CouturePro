import axios from "axios";

export default axios.create({
  baseURL: "https://couturepro.app/api", // backend sur VPS
});
