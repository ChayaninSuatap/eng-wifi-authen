import axios, { isAxiosError } from "axios";

export async function refreshSession(secret: string, username: string) {
  try {
    const response = await axios.post(
      "https://login-api.cmu.ac.th/",
      { username: username },
      { headers: { "x-session-secret": secret } }
    );
    console.log(response.data);
    return { ok: true, data: response.data };
  } catch (error) {
    if (isAxiosError(error) && error.response)
      return {
        status: error.response.status + " " + error.response.statusText,
        message: error.response.data.msg,
      };
    return {
      ok: false,
      status: "",
      message: "Oops, unknown error occurred, please try again later.",
    };
  }
}
