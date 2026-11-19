import type { Color } from "./colors.ts";

export interface Column {
	id: string;
	name: string;
	color: Color;
	visible: boolean;
	index: number;
	description?: string;
}
