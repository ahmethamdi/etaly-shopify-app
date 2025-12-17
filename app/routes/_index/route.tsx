import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Show Delivery Dates, Boost Conversions</h1>
        <p className={styles.text}>
          ETAly displays estimated delivery dates on your product and cart pages, reducing uncertainty and increasing customer confidence.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Smart ETA Calculation</strong>. Automatically calculates delivery dates based on processing time, shipping zones, cutoff times, and holidays.
          </li>
          <li>
            <strong>Flexible Rules Engine</strong>. Create custom delivery rules for different countries, carriers, and shipping methods with full timezone support.
          </li>
          <li>
            <strong>Easy Integration</strong>. Works seamlessly with your theme - just add the app block to product and cart pages. No coding required.
          </li>
        </ul>
      </div>
    </div>
  );
}
