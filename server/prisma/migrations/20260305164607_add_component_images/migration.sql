-- CreateTable
CREATE TABLE "ComponentImage" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComponentImage_componentId_idx" ON "ComponentImage"("componentId");

-- AddForeignKey
ALTER TABLE "ComponentImage" ADD CONSTRAINT "ComponentImage_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
