import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store, setupChecklistRealtime } from "@/store"
import "@fontsource-variable/outfit"
import "./index.css"
import App from "./App"
import { ThemeProvider } from "@/components/providers"
import { TooltipProvider } from "@/components/ui/tooltip"

// Initialize Supabase real-time snapshot subscription
setupChecklistRealtime()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
