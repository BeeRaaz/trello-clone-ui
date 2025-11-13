import Container from "./Container";

function Header() {
  return (
    <header>
      <Container className="flex flex-wrap justify-between items-center gap-5 h-20 py-3 bg-slate-500">
        <h1 className="font-bold tracking-tight text-2xl md:text-3xl">
          Trello Clone
        </h1>
      </Container>
    </header>
  );
}

export default Header;
