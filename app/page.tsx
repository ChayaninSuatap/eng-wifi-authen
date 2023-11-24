"use client";
import { deleteSession } from "@/libs/deleteSession";
import { signIn } from "@/libs/signIn";
import {
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

type Variant = "green" | "red" | "black";

type Log = {
  variant: Variant;
  message: string;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [refreshIntervalId, setRefreshIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const [refreshText, setRefreshText] = useState<string | null>(null);

  function addLog(message: string, variant: Variant) {
    setLogs((logs) => [...logs, { message, variant }]);
  }

  const scrollToBottom = () => {
    viewport.current!.scrollTo({
      top: viewport.current!.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(scrollToBottom, [logs, refreshText]);

  async function setTimerForRefreshingSession(expireDate: string) {
    const intervalId = setInterval(() => {
      const diffSecond = dayjs(expireDate).diff(new Date(), "s");
      setRefreshText(
        `Refreshing session in ${diffSecond.toLocaleString()} second(s)... Do not exit this app. (Minimize is OK)`
      );
    }, 1000);
    setRefreshIntervalId(intervalId);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setRefreshText(null);
      refreshSession();
    }, 1000 * 60 * 30 - 1000);
    setTimeoutId(timeoutId);
  }

  async function submitSignIn() {
    const signInResp = await signIn(username, password);

    if (signInResp.ok) {
      addLog("Sign-in successfully 🎉.", "green");
      addLog("You are now connected to the internet.", "green");
      addLog(
        `Session will be expired at ${dayjs(signInResp.expireAt).format(
          "MMMM D, YYYY h:mm A"
        )}`,
        "green"
      );
      setSecret(signInResp.secret);
      setTimerForRefreshingSession(signInResp.expireAt);
      setSignedIn(true);
    } else {
      addLog("Sign-in failed 😢.", "red");
      addLog(`${signInResp.message}`, "red");
    }
  }

  async function callDeleteSession() {
    const resp = await deleteSession(username, secret);
    if (resp.ok) {
      addLog("Session is deleted 🗑️.", "green");
      addLog("You are disconnected from the internet.", "green");
      setSignedIn(false);
      setRefreshText(null);
      if (refreshIntervalId) clearInterval(refreshIntervalId);
      if (timeoutId) clearTimeout(timeoutId);
      setRefreshIntervalId(null);
      setTimeoutId(null);
    }
  }

  async function refreshSession() {
    const signInResp = await signIn(username, password);
    if (signInResp.ok) {
      addLog(
        `Session is refreshed. It will be expired at ${dayjs(
          signInResp.expireAt
        ).format("MMMM D, YYYY h:mm A")}`,
        "green"
      );
      setSecret(signInResp.secret);
      setTimerForRefreshingSession(signInResp.expireAt);
    } else {
      addLog("Refreshing session failed 😢.", "red");
      addLog(`${signInResp.message}`, "red");
    }
  }

  useEffect(() => {
    setLogs([
      ...logs,
      {
        message: "Hi, please sign-in using your CMU Account (email).",
        variant: "black",
      },
    ]);
  }, []);

  return (
    <Box p="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSignIn();
        }}
      >
        <Group align="end" mb="sm">
          <TextInput
            label="CMU Account"
            placeholder="CMU EMAIL"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={signedIn}
            name="cmuAccount"
            w="200px"
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={signedIn}
            w="200px"
          />

          <Button type="submit" disabled={!username || !password || signedIn}>
            Sign-In
          </Button>

          {signedIn && (
            <Button color="red" onClick={callDeleteSession}>
              Delete Session
            </Button>
          )}
        </Group>
      </form>
      {/* <input placeholder="Token" value={token} readOnly />
      <button onClick={signInButtonHandler}>SIGN IN</button>
      <button onClick={refreshButtonHandler}>REFRESH</button> */}

      <Text>Logs</Text>
      <Paper withBorder>
        <ScrollArea h="360px" p="xs" type="always" viewportRef={viewport}>
          {logs.map((log, i) => (
            <Text c={log.variant} key={i}>
              {log.message}
            </Text>
          ))}
          {refreshText && <Text c="green"> {refreshText}</Text>}
        </ScrollArea>
      </Paper>
    </Box>
  );
}
