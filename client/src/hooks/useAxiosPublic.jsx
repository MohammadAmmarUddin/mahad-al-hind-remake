import axios from "axios";
import { API_BASE } from "../config/api";

const axiosPublic = axios.create({
  baseURL: API_BASE,
});
const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
