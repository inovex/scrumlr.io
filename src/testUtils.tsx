import {render, RenderOptions} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {FC, PropsWithChildren, ReactElement, ReactNode} from "react";
import {MemoryRouter, Outlet, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "./i18nTest";

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

interface AllTheProvidersProps {
  children: ReactNode;
  context: unknown;
}

const AllTheProvidersWithContext: FC<AllTheProvidersProps> = ({children, context}) => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<Outlet context={context} />}>
        <Route index element={<AllTheProvidersWithoutRouter>{children}</AllTheProvidersWithoutRouter>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

const customRender = (ui: ReactElement, options?: Omit<RenderOptions & {container: Element}, "wrapper">) => render(ui, {wrapper: AllTheProviders, ...options});

const customRenderWithContext = (ui: ReactElement, context: unknown, options?: Omit<RenderOptions & {container: Element}, "wrapper">) =>
  render(ui, {wrapper: (props) => <AllTheProvidersWithContext context={context} {...props} />, ...options});

const customRenderWithoutRouter = (ui: ReactElement, options?: Omit<RenderOptions & {container: Element}, "wrapper">) =>
  render(ui, {wrapper: AllTheProvidersWithoutRouter, ...options});

export {customRender as render, customRenderWithContext as renderWithContext, customRenderWithoutRouter as renderWithoutRouter};
