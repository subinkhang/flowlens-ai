import { SessionProvider } from "../../contexts/SessionProvider";
import AnalyzePage from "../AnalyzePage";

const AnalyzePageWrapper = () => (
  <SessionProvider>
    <AnalyzePage />
  </SessionProvider>
);

export default AnalyzePageWrapper;
