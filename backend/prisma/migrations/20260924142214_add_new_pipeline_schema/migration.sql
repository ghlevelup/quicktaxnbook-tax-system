-- CreateEnum
CREATE TYPE "ClientDocStage" AS ENUM ('REQUESTED', 'RECEIVED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'AWAITING_SIGNATURE', 'AWAITING_PAYMENT', 'COMPLETED');

-- CreateTable
CREATE TABLE "GhlPipeline" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "ghlPipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDocumentPipeline" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhlPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GhlPipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "ghlStageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "clientStage" "ClientDocStage" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhlPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GhlOpportunity" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "ghlOpportunityId" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "stageId" TEXT,
    "ghlContactId" TEXT,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "monetaryValue" DECIMAL(12,2),
    "customFields" JSONB,
    "ghlCreatedAt" TIMESTAMP(3),
    "ghlUpdatedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhlOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GhlPipeline_firmId_isDocumentPipeline_idx" ON "GhlPipeline"("firmId", "isDocumentPipeline");

-- CreateIndex
CREATE UNIQUE INDEX "GhlPipeline_firmId_ghlPipelineId_key" ON "GhlPipeline"("firmId", "ghlPipelineId");

-- CreateIndex
CREATE INDEX "GhlPipelineStage_pipelineId_position_idx" ON "GhlPipelineStage"("pipelineId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "GhlPipelineStage_pipelineId_ghlStageId_key" ON "GhlPipelineStage"("pipelineId", "ghlStageId");

-- CreateIndex
CREATE INDEX "GhlOpportunity_firmId_pipelineId_idx" ON "GhlOpportunity"("firmId", "pipelineId");

-- CreateIndex
CREATE INDEX "GhlOpportunity_clientId_idx" ON "GhlOpportunity"("clientId");

-- CreateIndex
CREATE INDEX "GhlOpportunity_ghlContactId_idx" ON "GhlOpportunity"("ghlContactId");

-- CreateIndex
CREATE UNIQUE INDEX "GhlOpportunity_firmId_ghlOpportunityId_key" ON "GhlOpportunity"("firmId", "ghlOpportunityId");

-- AddForeignKey
ALTER TABLE "GhlPipeline" ADD CONSTRAINT "GhlPipeline_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhlPipelineStage" ADD CONSTRAINT "GhlPipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "GhlPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhlOpportunity" ADD CONSTRAINT "GhlOpportunity_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhlOpportunity" ADD CONSTRAINT "GhlOpportunity_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "GhlPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhlOpportunity" ADD CONSTRAINT "GhlOpportunity_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "GhlPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhlOpportunity" ADD CONSTRAINT "GhlOpportunity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
