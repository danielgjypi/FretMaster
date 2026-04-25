/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./components/ThemeProvider";
import { MainApp } from "./components/MainApp";

export default function App() {
  return (
    <ThemeProvider defaultTheme="zinc" storageKey="fretmaster-theme">
      <MainApp />
    </ThemeProvider>
  );
}
