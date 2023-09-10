type StageNode = {
	vsStageId: number;
	originalImage: { url: string };
	name: string;
	stats?: unknown;
	id: string;
}

export type VsStages = {
	vsStages: { nodes: StageNode[] };
}