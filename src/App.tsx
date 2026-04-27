/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./components/ThemeProvider";
import { MainApp } from "./components/MainApp";
import { EasterEggProvider } from "./components/EasterEgg";

export default function App() {
  return (
    <ThemeProvider defaultTheme="zinc" storageKey="fretmaster-theme">
      <EasterEggProvider>
        <MainApp />
      </EasterEggProvider>
    </ThemeProvider>
  );
}
