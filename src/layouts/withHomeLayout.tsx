// src/layouts/withHomeLayout.tsx
import React from "react";

export type HomeLayoutComponent = React.ComponentType<React.PropsWithChildren<{}>>;

/**
 * Wrap a page with the HomeLayout.
 * Usage:
 *   export default withHomeLayout(HomeLayout)(HomePage)
 */
export function withHomeLayout(Layout: HomeLayoutComponent) {
  return function wrap<P extends object>(Page: React.ComponentType<P>) {
    const WithHomeLayout: React.FC<P> = (props) => (
      <Layout>
        <Page {...props} />
      </Layout>
    );
    WithHomeLayout.displayName = `withHomeLayout(${Page.displayName || Page.name || "Component"})`;
    return WithHomeLayout;
  };
}
