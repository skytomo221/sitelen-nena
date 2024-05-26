import React, { StrictMode } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { toBrailles } from "./braille";

export default function App() {
  const [value, setValue] = React.useState("toki pona li toki pona.");

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div>{toBrailles(value)}</div>
    </Box>
  );
}
