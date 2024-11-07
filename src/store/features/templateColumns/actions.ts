import {createAction} from "@reduxjs/toolkit";
import {TemplateColumn} from "./types";

export const addTemplateColumnOptimistically = createAction<{templateColumn: TemplateColumn; index: number}>("templateColumns/addTemplateColumnOptimistically");
export const moveTemplateColumnOptimistically = createAction<{templateColumn: TemplateColumn; toIndex: number}>("templateColumns/moveTemplateColumnOptimistically");
