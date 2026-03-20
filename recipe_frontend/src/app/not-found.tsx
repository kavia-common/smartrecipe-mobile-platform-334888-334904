import Link from "next/link";

export default function NotFound() {
  return (
    <main className="loading-screen">
      <section className="loading-card" role="alert" aria-live="assertive">
        <p className="section-header__eyebrow">404</p>
        <h1 className="loading-card__title">This recipe page could not be found.</h1>
        <p className="muted-copy" style={{ marginTop: "0.75rem" }}>
          The page you requested does not exist yet or may have moved.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/" className="primary-button">
            Return to SmartRecipe
          </Link>
        </div>
      </section>
    </main>
  );
}
