import {createAction} from "@reduxjs/toolkit";
import {TemplateWithColumns} from "./types";

export const addTemplateOptimistically = createAction<TemplateWithColumns>("templates/addTemplateOptimistically");
