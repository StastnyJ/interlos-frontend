import React, { useState } from "react";
import {
  Button,
  Container,
  IconButton,
  MuiThemeProvider,
  createMuiTheme,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  CssBaseline,
} from "@material-ui/core";
import { api } from "./utils/ApiService";
import { Alert, Color } from "@material-ui/lab";
import { Delete, Publish, Search } from "@material-ui/icons";

type historyType = { code: string; response: string }[];

function App() {
  const [history, setHistory] = useState<historyType>(JSON.parse(localStorage.getItem("codeHistory") || "[]"));
  const [actCode, setActCode] = useState(localStorage.getItem("actCode") || "");
  const [isLoading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(JSON.parse(localStorage.getItem("darkMode") || "false"));

  const [openedChR, setOpenedChR] = useState<string[]>([]);

  const [alertShown, setAlertShown] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<Color>("warning");

  const saveCode = (val: string) => {
    localStorage.setItem("actCode", val);
    setActCode(val);
  };

  const saveHistory = (newHistory: historyType) => {
    localStorage.setItem("codeHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const saveDarkMode = (dm: boolean) => {
    localStorage.setItem("darkMode", JSON.stringify(dm));
    setDarkMode(dm);
  };

  const evaluateCode = () => {
    setLoading(true);
    api.post(
      "/eval",
      {},
      actCode.replace(/[\s]*/g, ""),
      {
        success: (response: string) => {
          setAlertShown(true);
          setAlertSeverity(response.includes("Heslo") ? "success" : "warning");
          setAlertText(response);
          saveHistory([...history, { code: actCode, response: response }]);
          setLoading(false);
        },
        error: () => {
          setAlertShown(true);
          setAlertSeverity("error");
          setAlertText("Při vyhodnocování došlo k chybě. Zkuste to později a případně kontaktujte některého z organizátorů");
          setLoading(false);
        },
      },
      true
    );
  };

  return (
    <MuiThemeProvider
      theme={createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
          primary: {
            main: "#1976d2",
          },
        },
      })}
    >
      <CssBaseline />
      <Container maxWidth="lg">
        <br />
        <br />
        <TextField
          value={actCode}
          onChange={(e) => saveCode(e.target.value)}
          multiline
          label="Zde napiš svůj příkaz."
          rows={8}
          variant="outlined"
          fullWidth
        />
        <br />
        <br />
        <div style={{ display: "flex" }}>
          <Button color="primary" disabled={isLoading || actCode.length === 0} variant="contained" onClick={evaluateCode}>
            {isLoading ? "Vyhodnocuji" : "Odeslat příkaz"}
          </Button>
          <div style={{ flexGrow: 1 }}></div>
          <Button onClick={() => saveDarkMode(!darkMode)}>{darkMode ? "Light mode" : "Dark mode"}</Button>
        </div>
        {history && history.length > 0 && (
          <>
            <br />
            <br />
            <br />
            <Typography variant="h6">Historie</Typography>
            <br />
            <Table>
              <TableBody>
                {history.map((h, i) => (
                  <React.Fragment key={i.toString() + h.code}>
                    <TableRow>
                      <TableCell>{i}</TableCell>
                      <TableCell>{h.response}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => {
                            saveHistory(history.filter((_, ind) => ind !== i));
                            setOpenedChR([]);
                          }}
                          aria-label="delete"
                        >
                          <Delete color="error" />
                        </IconButton>
                        <IconButton onClick={() => saveCode(h.code)} aria-label="delete">
                          <Publish color="primary" />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            openedChR.includes(i.toString() + h.code)
                              ? setOpenedChR(openedChR.filter((chr) => chr !== i.toString() + h.code))
                              : setOpenedChR([...openedChR, i.toString() + h.code])
                          }
                          aria-label="delete"
                        >
                          <Search />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {openedChR.includes(i.toString() + h.code) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          {h.code}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            <br />
            <br />
            <Button color="secondary" onClick={() => saveHistory([])}>
              Smazat historii
            </Button>
          </>
        )}

        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={alertShown}
          autoHideDuration={6000}
          onClose={() => setAlertShown(false)}
        >
          <Alert variant="filled" onClose={() => setAlertShown(false)} severity={alertSeverity}>
            {alertText}
          </Alert>
        </Snackbar>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
