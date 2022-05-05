import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { magic } from "../lib/magic-client";

import styles from "../styles/Login.module.css";

const Login = () => {
  const [userMsg, setUserMsg] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleComplete = () => {
      setIsLoading(false);
    };
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        setIsLoading(true);
        const didToken = await magic.auth.loginWithMagicLink({
          email,
        });
        if (didToken) {
          console.log(didToken);
          const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${didToken}`,
              "content-type": "application/json",
            },
          });
          const loggedInResponse = await response.json();
          if (loggedInResponse.done) {
            router.push("/");
          } else {
            setIsLoading(false);
            setUserMsg("Something went wrong loggin in");
          }
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    } else {
      setUserMsg("Enter a valid email address");
    }
  };

  const handleOnChangeEmail = (e) => {
    setUserMsg("");
    const email = e.target.value;
    setEmail(email);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Netflix SignIn</title>
      </Head>
      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <Link href="/">
            <a className={styles.logoLink}>
              <div className={styles.logoWrapper}>
                <Image
                  src="/static/netflix.svg"
                  alt="Netflix logo"
                  width="128px"
                  height="34px"
                />
              </div>
            </a>
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.mainWrapper}>
          <h1 className={styles.signinHeader}>Sign In</h1>
          <input
            className={styles.emailInput}
            type="text"
            placeholder="Email address"
            onChange={handleOnChangeEmail}
          />
          <p className={styles.userMsg}>{userMsg}</p>
          <button className={styles.loginBtn} onClick={handleLoginWithEmail}>
            {isLoading ? "Loading..." : "Sign In"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
