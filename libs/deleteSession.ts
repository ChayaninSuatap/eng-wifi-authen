import axios from "axios";

type DeleteSessionOK = {
  ok: true;
};

type DeleteSessionError = {
  ok: false;
  message: string;
};

export async function deleteSession(username: string, secret: string) {
  try {
    await axios.delete(`https://login-api.cmu.ac.th/${username}/${secret}`, {
      headers: { "x-session-secret": secret },
    });

    return { ok: true } as DeleteSessionOK;
  } catch {
    return {
      ok: false,
      message: "Oops, unknown error occurred, please try again later.",
    } as DeleteSessionError;
  }
}
