import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Link,
  Unlink,
  ZoomIn,
  ZoomOut,
  // Maximize,
  // Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Brain,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuickTaskDialog } from '@/components/quick-task-dialog'
import { useFlowStore } from '@/store/flow-store'
import { Task } from '@/store/flow-store'

interface TaskNode {
  id: string
  task: Task
  x: number
  y: number
  connections: string[]
}

interface Connection {
  from: string
  to: string
  type: 'dependency' | 'related' | 'blocks'
}

export function TaskGraphView() {
  const { tasks, activeProject, decomposeTask, startFlowSession } = useFlowStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [nodes, setNodes] = useState<TaskNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [linkingMode, setLinkingMode] = useState(false)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  // const [isDragging, setIsDragging] = useState<string | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddLinkedTo, setQuickAddLinkedTo] = useState<string | null>(null)

  const projectTasks = tasks.filter(task => task.projectId === activeProject)

  // Initialize nodes with better positioning
  useEffect(() => {
    if (projectTasks.length === 0) return

    const newNodes: TaskNode[] = projectTasks.map((task, index) => {
      const angle = (index / projectTasks.length) * 2 * Math.PI
      const radius = Math.min(200 + projectTasks.length * 20, 400)
      const centerX = 400
      const centerY = 300
      
      return {
        id: task.id,
        task,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        connections: []
      }
    })

    setNodes(newNodes)
  }, [projectTasks])

  const getNodeColor = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-100 border-green-400 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 border-blue-400 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444'
      case 'high':
        return '#f97316'
      case 'medium':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const handleNodeClick = (nodeId: string) => {
    if (linkingMode && linkFrom && linkFrom !== nodeId) {
      // Create connection
      const newConnection: Connection = {
        from: linkFrom,
        to: nodeId,
        type: 'dependency'
      }
      setConnections(prev => [...prev, newConnection])
      setLinkingMode(false)
      setLinkFrom(null)
    } else if (linkingMode) {
      setLinkFrom(nodeId)
    } else {
      setSelectedNode(selectedNode === nodeId ? null : nodeId)
    }
  }

  const handleNodeDrag = (nodeId: string, deltaX: number, deltaY: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
        : node
    ))
  }

  const removeConnection = (from: string, to: string) => {
    setConnections(prev => prev.filter(conn => 
      !(conn.from === from && conn.to === to)
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in-progress':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const selectedTask = selectedNode ? nodes.find(n => n.id === selectedNode)?.task : null

  return (
    <div className="h-full flex">
      {/* Main Graph Area */}
      <div 
        className="flex-1 relative overflow-hidden bg-slate-950" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(100,116,139,0.1) 1px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(100,116,139,0.05) 1px, transparent 0)
          `,
          backgroundSize: '50px 50px'
        }}
        onWheel={(e) => {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -0.1 : 0.1
          setZoom(prev => Math.max(0.3, Math.min(3, prev + delta)))
        }}
        onMouseDown={(e) => {
          if (e.button === 0 && !(e.target as HTMLElement).closest('.task-node')) { // Left click for panning (not on nodes)
            e.preventDefault()
            const startX = e.clientX - pan.x
            const startY = e.clientY - pan.y
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              setPan({
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY
              })
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }
        }}
      >
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
            onClick={() => {
              setQuickAddLinkedTo(null)
              setQuickAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
          
          <Button
            className={linkingMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"}
            size="sm"
            onClick={() => {
              setLinkingMode(!linkingMode)
              setLinkFrom(null)
            }}
          >
            <Link className="h-4 w-4 mr-1" />
            {linkingMode ? 'Cancel Link' : 'Link Tasks'}
          </Button>
          
          <Button
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-4 bg-black/80 text-white border-gray-700">
            <div className="space-y-3 text-xs">
              <div className="font-semibold mb-3 text-gray-200">Node Legend</div>
              
              <div className="space-y-2">
                <div className="text-gray-300 font-medium">Status:</div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>To Do</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Completed</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-700">
                <div className="text-gray-300 font-medium">Priority:</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Urgent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SVG Canvas */}
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minWidth: '100%', minHeight: '100%' }}
          >
            {/* Connections */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="11"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="#4f46e5"
                  fillOpacity="0.8"
                />
              </marker>
              
              {/* Glow filter for connections */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {connections.map((conn, index) => {
              const fromNode = nodes.find(n => n.id === conn.from)
              const toNode = nodes.find(n => n.id === conn.to)
              
              if (!fromNode || !toNode) return null
              
              // Calculate connection points on circle edges
              const dx = toNode.x - fromNode.x
              const dy = toNode.y - fromNode.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const radius = 40 // Approximate node radius
              
              const startX = fromNode.x + (dx / distance) * radius
              const startY = fromNode.y + (dy / distance) * radius
              const endX = toNode.x - (dx / distance) * radius
              const endY = toNode.y - (dy / distance) * radius
              
              return (
                <g key={index}>
                  {/* Connection Line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeOpacity="0.7"
                    markerEnd="url(#arrowhead)"
                    className="hover:stroke-blue-400 hover:stroke-opacity-100 cursor-pointer transition-all duration-200"
                    onClick={() => removeConnection(conn.from, conn.to)}
                  />
                  
                  {/* Connection Label */}
                  <rect
                    x={(startX + endX) / 2 - 25}
                    y={(startY + endY) / 2 - 8}
                    width="50"
                    height="16"
                    fill="rgba(79, 70, 229, 0.9)"
                    rx="8"
                    className="cursor-pointer"
                    onClick={() => removeConnection(conn.from, conn.to)}
                  />
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 + 3}
                    textAnchor="middle"
                    className="text-[10px] fill-white pointer-events-none font-medium"
                  >
                    {conn.type}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Task Nodes - Obsidian Style */}
          {nodes.map((node) => {
            const nodeSize = 60 + (node.task.title.length * 0.8) // Dynamic size based on title length
            const maxSize = 120
            const finalSize = Math.min(nodeSize, maxSize)
            
            return (
              <motion.div
                key={node.id}
                className="absolute task-node"
                style={{
                  left: node.x - finalSize/2,
                  top: node.y - finalSize/2,
                  width: finalSize,
                  height: finalSize,
                }}
                drag
                onDrag={(_, info) => handleNodeDrag(node.id, info.delta.x, info.delta.y)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Node Circle */}
                <div
                  className={`
                    w-full h-full rounded-full cursor-pointer transition-all duration-300 
                    flex items-center justify-center text-center p-3
                    shadow-lg hover:shadow-xl
                    ${node.task.status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${node.task.status === 'in-progress' ? 'bg-blue-500 text-white' : ''}
                    ${node.task.status === 'todo' ? 'bg-gray-700 text-gray-100' : ''}
                    ${selectedNode === node.id ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
                    ${linkingMode && linkFrom === node.id ? 'ring-4 ring-green-400 ring-opacity-60' : ''}
                  `}
                  style={{
                    borderLeft: `4px solid ${getPriorityColor(node.task.priority)}`,
                  }}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <span className="text-xs font-medium leading-tight line-clamp-3">
                    {node.task.title}
                  </span>
                </div>

                {/* Priority Indicator */}
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getPriorityColor(node.task.priority) }}
                />

                {/* Status Icon */}
                <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-1 shadow-sm">
                  {getStatusIcon(node.task.status)}
                </div>

                {/* Hover Tooltip */}
                {selectedNode === node.id && node.task.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50"
                  >
                    <div className="bg-black text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-xl">
                      <div className="font-medium mb-1">{node.task.title}</div>
                      <div className="text-gray-300">{node.task.description}</div>
                      {node.task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {node.task.tags.map(tag => (
                            <span key={tag} className="bg-gray-700 px-1 py-0.5 rounded text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Tooltip Arrow */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Linking Instructions */}
        {linkingMode && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                {linkFrom ? 'Click another task to create a connection' : 'Click a task to start linking'}
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Task Details Panel */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Task Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                >
                  ×
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedTask.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={getNodeColor(selectedTask)}>
                    {selectedTask.status}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: getPriorityColor(selectedTask.priority) + '20',
                      color: getPriorityColor(selectedTask.priority),
                      borderColor: getPriorityColor(selectedTask.priority) + '40'
                    }}
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>

                {selectedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedTask.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => decomposeTask(selectedTask.id)}
                  disabled={selectedTask.subtasks.length > 0}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {selectedTask.subtasks.length > 0 ? 'Already Decomposed' : 'AI Decompose'}
                </Button>

                {selectedTask.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => startFlowSession(selectedTask.id, ['github.com', 'localhost'])}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Flow Session
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setQuickAddLinkedTo(selectedTask.id)
                    setQuickAddOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Linked Task
                </Button>
              </div>

              {/* Connected Tasks */}
              <div>
                <h5 className="font-medium mb-2">Connected Tasks</h5>
                <div className="space-y-2">
                  {connections
                    .filter(conn => conn.from === selectedTask.id || conn.to === selectedTask.id)
                    .map((conn, index) => {
                      const connectedTaskId = conn.from === selectedTask.id ? conn.to : conn.from
                      const connectedTask = tasks.find(t => t.id === connectedTaskId)
                      const isOutgoing = conn.from === selectedTask.id
                      
                      if (!connectedTask) return null
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{connectedTask.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {isOutgoing ? '→ Depends on this' : '← This depends on'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConnection(conn.from, conn.to)}
                          >
                            <Unlink className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  
                  {connections.filter(conn => 
                    conn.from === selectedTask.id || conn.to === selectedTask.id
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">No connected tasks</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickTaskDialog 
        open={quickAddOpen} 
        onOpenChange={setQuickAddOpen}
        linkedTaskId={quickAddLinkedTo || undefined}
      />
    </div>
  )
}