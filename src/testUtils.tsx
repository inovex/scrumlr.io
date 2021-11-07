import {render, RenderOptions} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {ReactElement} from "react";
import i18n from "./i18nTest";

export type AssertTypeEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;

const AllTheProviders = ({children}: any) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

const customRender = (ui: ReactElement, options?: Omit<RenderOptions & {container: Element}, "wrapper">) => render(ui, {wrapper: AllTheProviders, ...options});

export * from "@testing-library/react";
export {customRender as render};
