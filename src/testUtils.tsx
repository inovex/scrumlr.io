import {render, RenderOptions} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {FC, PropsWithChildren, ReactElement} from "react";
import {InitialEntry, MemoryRouter, Outlet, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "./i18nTest";

type Context = {context: unknown; initialRouteEntries?: InitialEntry[]; currentPath?: string};
type PropsWithChildrenAndContext = PropsWithChildren & Context;

export type AssertTypeEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;

const AllTheProvidersWithoutRouter: FC<PropsWithChildren> = ({children}) => (
  <I18nextProvider i18n={i18n}>
    <Provider store={getTestStore()}>{children}</Provider>
  </I18nextProvider>
);

const AllTheProviders: FC<PropsWithChildren> = ({children}) => (
  <MemoryRouter>
    <AllTheProvidersWithoutRouter>{children}</AllTheProvidersWithoutRouter>
  </MemoryRouter>
);

// renders while allowing for features like useOutletContext, useLocation, and useParams
const AllTheProvidersWithContext: FC<PropsWithChildrenAndContext> = ({children, context, initialRouteEntries = ["/"], currentPath = "/"}) => (
  <MemoryRouter initialEntries={initialRouteEntries}>
    <Routes>
      <Route path={currentPath} element={<Outlet context={context} />}>
        <Route index element={<AllTheProvidersWithoutRouter>{children}</AllTheProvidersWithoutRouter>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

const customRender = (ui: ReactElement, options?: Omit<RenderOptions & {container: Element}, "wrapper">) => render(ui, {wrapper: AllTheProviders, ...options});

const customRenderWithContext = (ui: ReactElement, context: Context, options?: Omit<RenderOptions & {container: Element}, "wrapper">) =>
  render(ui, {wrapper: (props) => <AllTheProvidersWithContext {...context} {...props} />, ...options});

const customRenderWithoutRouter = (ui: ReactElement, options?: Omit<RenderOptions & {container: Element}, "wrapper">) =>
  render(ui, {wrapper: AllTheProvidersWithoutRouter, ...options});

export {customRender as render, customRenderWithContext as renderWithContext, customRenderWithoutRouter as renderWithoutRouter};
