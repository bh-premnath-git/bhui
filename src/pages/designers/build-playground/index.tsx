import { ReactFlowProvider } from "reactflow"
import BuildPlayGround from "@/features/designers/pipeline/Buildpipeline"
const index = () => {
  return (
    <ReactFlowProvider>
        <BuildPlayGround />
    </ReactFlowProvider>
  )
}

export default index