import Header from "./components/Header";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar />
        <Main />
      </div>
    </>
  );
}

export default App;
