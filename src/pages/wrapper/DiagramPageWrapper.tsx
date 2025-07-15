import { SessionProvider } from "../../contexts/SessionProvider";
import { DiagramPage } from "../DiagramPage";

const DiagramPageWrapper = () => (
  <SessionProvider>
    <DiagramPage />
  </SessionProvider>
);

export default DiagramPageWrapper;
