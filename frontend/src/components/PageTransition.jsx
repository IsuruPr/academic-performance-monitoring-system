import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState("enter"); // "enter" | "exit"

  useEffect(() => {
    // Start exit animation
    setTransitionState("exit");

    const timeout = setTimeout(() => {
      // Swap content and start enter animation
      setDisplayChildren(children);
      setTransitionState("enter");
    }, 220); // Must match exit animation duration

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Update children if no route change (e.g. same path re-render)
  useEffect(() => {
    if (transitionState === "enter") {
      setDisplayChildren(children);
    }
  }, [children]);

  return (
    <div
      style={{
        transition: "opacity 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)",
        opacity: transitionState === "exit" ? 0 : 1,
        transform: transitionState === "exit" ? "translateY(10px)" : "translateY(0px)",
      }}
    >
      {displayChildren}
    </div>
  );
}
