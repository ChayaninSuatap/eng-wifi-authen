import axios, { isAxiosError } from "axios";

type Session = {
  createat: string;
  expire: string;
  ip: string;
  secret: string;
  username: string;
};

type CurrentSession = {
  username: string;
  secret: string;
};

type SignInApiResp = {
  current_session: CurrentSession;
  all_session: Session[];
};

type SignInOK = {
  ok: true;
  secret: string;
  expireAt: string;
};

type SignInError = {
  ok: false;
  status: string;
  message: string;
};

export const signIn = async (username: string, password: string) => {
  try {
    const response = await axios.post<SignInApiResp>(
      "https://login-api.cmu.ac.th/login",
      {
        username: username,
        password: password,
      }
    );

    return {
      ok: true,
      secret: response.data.current_session.secret,
      expireAt: response.data.all_session[0].expire,
    } as SignInOK;
  } catch (error) {
    if (isAxiosError(error) && error.response)
      return {
        ok: false,
        status: error.response.status + " " + error.response.statusText,
        message: error.response.data.msg,
      } as SignInError;
    return {
      ok: false,
      status: "",
      message: "Oops, unknown error occurred, please try again later.",
    } as SignInError;
  }
};
