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
  Trash2,
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
  const { tasks, activeProject, decomposeTask, startFlowSession, deleteTask } = useFlowStore()
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
  const [isDragging, setIsDragging] = useState(false)

  const projectTasks = tasks.filter(task => task.projectId === activeProject)

  // Large circle layout so nodes don't overlap
  useEffect(() => {
    if (projectTasks.length === 0) return

    const centerX = 400
    const centerY = 300
    // Much larger radius based on number of nodes
    const radius = Math.max(300, projectTasks.length * 25)

    const newNodes: TaskNode[] = projectTasks.map((task, index) => {
      const angle = (index / projectTasks.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      return {
        id: task.id,
        task,
        x: x,
        y: y,
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
    // Don't handle clicks if we were just dragging
    if (isDragging) return
    
    if (linkingMode) {
      if (!linkFrom) {
        setLinkFrom(nodeId)
      } else if (linkFrom === nodeId) {
        setLinkFrom(null)
      } else {
        // Create connection
        setConnections(prev => [...prev, {
          from: linkFrom,
          to: nodeId,
          type: 'dependency'
        }])
        setLinkingMode(false)
        setLinkFrom(null)
      }
    } else {
      setSelectedNode(selectedNode === nodeId ? null : nodeId)
    }
  }

  const handleNodeDrag = (nodeId: string, deltaX: number, deltaY: number) => {
    console.log('Dragging node:', nodeId, 'delta:', deltaX, deltaY)
    setIsDragging(true)
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, x: node.x + deltaX / zoom, y: node.y + deltaY / zoom }
        : node
    ))
  }

  const handleDragEnd = () => {
    // Small delay to prevent click events immediately after dragging
    setTimeout(() => {
      setIsDragging(false)
    }, 100)
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
        className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center" 
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
          setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
        }}
        onMouseDown={(e) => {
          if (e.button === 0 && !(e.target as HTMLElement).closest('.task-node')) {
            e.preventDefault()
            const startX = e.clientX
            const startY = e.clientY
            const startPanX = pan.x
            const startPanY = pan.y
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = (moveEvent.clientX - startX) / zoom
              const deltaY = (moveEvent.clientY - startY) / zoom
              setPan({
                x: startPanX + deltaX,
                y: startPanY + deltaY
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
              setSelectedNode(null)
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
          
          <Button
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            size="sm"
            onClick={() => {
              // Fit all nodes to view like Obsidian
              if (nodes.length === 0) return
              
              const minX = Math.min(...nodes.map(n => n.x)) - 100
              const maxX = Math.max(...nodes.map(n => n.x)) + 100
              const minY = Math.min(...nodes.map(n => n.y)) - 100
              const maxY = Math.max(...nodes.map(n => n.y)) + 100
              
              const width = maxX - minX
              const height = maxY - minY
              const centerX = (minX + maxX) / 2
              const centerY = (minY + maxY) / 2
              
              const scaleX = (window.innerWidth * 0.8) / width
              const scaleY = (window.innerHeight * 0.8) / height
              const newZoom = Math.min(scaleX, scaleY, 1.5)
              
              setZoom(newZoom)
              setPan({
                x: -centerX + 400,
                y: -centerY + 300
              })
            }}
            title="Fit to View"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
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

              <div className="space-y-2 pt-2 border-t border-gray-700">
                <div className="text-gray-300 font-medium">Actions:</div>
                <div className="text-xs text-gray-400">
                  • 🖱️ Click connections to delete
                </div>
                <div className="text-xs text-gray-400">
                  • ✋ Drag nodes to reposition
                </div>
                <div className="text-xs text-gray-400">
                  • 🔗 Use Link Mode to connect tasks
                </div>
                <div className="text-xs text-gray-400">
                  • 🖱️ Click nodes to select/link
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="w-full h-full relative"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* SVG for connections - same transform as nodes */}
          <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            style={{ 
              width: '100%', 
              height: '100%',
              overflow: 'visible'
            }}
          >
            {/* Connections */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="12"
                refX="10"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="#4f46e5"
                />
              </marker>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
              
              // Line from edge to edge of circles
              const dx = toNode.x - fromNode.x
              const dy = toNode.y - fromNode.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance === 0) return null
              
              // Calculate precise visual radius:
              // Node container is 100px, but we need to account for visual styling
              // The actual visual edge appears to be slightly less due to borders/padding
              const visualRadius = 48 // Slightly smaller to hit the visual edge
              
              // Start point (at the visual edge of from node)
              const startX = fromNode.x + (dx / distance) * visualRadius
              const startY = fromNode.y + (dy / distance) * visualRadius
              
              // End point (at the visual edge of to node, with space for arrow)
              // Arrow needs about 8px space to not overlap the node
              const endX = toNode.x - (dx / distance) * (visualRadius + 8)
              const endY = toNode.y - (dx / distance) * (visualRadius + 8)
              
              return (
                <g 
                  key={`${conn.from}-${conn.to}-${index}`}
                  className="group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Removing connection:', conn.from, '->', conn.to)
                    removeConnection(conn.from, conn.to)
                  }}
                >
                  {/* Background glow line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#4f46e5"
                    strokeWidth="6"
                    opacity="0.3"
                    filter="url(#glow)"
                    className="pointer-events-none"
                  />
                  {/* Invisible thick line for easier clicking */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth="15"
                    className="pointer-events-auto"
                  />
                  {/* Main connection line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#4f46e5"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                    className="pointer-events-none transition-all duration-200 group-hover:stroke-red-400"
                    opacity="0.9"
                  />
                  {/* Delete indicator on hover */}
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 10}
                    fill="red"
                    fontSize="12"
                    textAnchor="middle"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-bold"
                  >
                    ✕ Click to delete
                  </text>
                  
                  {/* Debug: Connection points (temporary - remove after testing) */}
                  <circle cx={startX} cy={startY} r="3" fill="#00ff00" opacity="0.8" />
                  <circle cx={endX} cy={endY} r="3" fill="#ff0000" opacity="0.8" />
                </g>
              )
            })}
            
            {/* Debug: Node boundary circles (temporary) */}
            {nodes.map((node) => (
              <g key={`debug-${node.id}`}>
                {/* Outer boundary (container) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="50"
                  fill="none"
                  stroke="yellow"
                  strokeWidth="1"
                  opacity="0.3"
                  className="pointer-events-none"
                />
                {/* Visual boundary (where connections should hit) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="48"
                  fill="none"
                  stroke="orange"
                  strokeWidth="2"
                  opacity="0.7"
                  className="pointer-events-none"
                />
              </g>
            ))}
          </svg>



          {/* Task Nodes - Obsidian Style */}
          {nodes.map((node) => {
            const finalSize = 100 // Fixed size
            
            return (
              <motion.div
                key={node.id}
                className="absolute task-node"
                style={{
                  left: node.x - finalSize/2,
                  top: node.y - finalSize/2,
                  width: finalSize,
                  height: finalSize,
                  zIndex: selectedNode === node.id ? 100 : 1
                }}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={false}
                onDragStart={() => setIsDragging(true)}
                onDrag={(_, info) => {
                  handleNodeDrag(node.id, info.delta.x, info.delta.y)
                }}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.05, zIndex: 1000 }}
              >
                {/* Node Circle */}
                <div
                  className={`
                    w-full h-full rounded-full transition-all duration-200 
                    flex items-center justify-center text-center p-3
                    shadow-lg border-2
                    ${isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab'}
                    ${node.task.status === 'completed' ? 'bg-green-500 text-white border-green-400' : ''}
                    ${node.task.status === 'in-progress' ? 'bg-blue-500 text-white border-blue-400' : ''}
                    ${node.task.status === 'todo' ? 'bg-gray-700 text-gray-100 border-gray-600' : ''}
                    ${selectedNode === node.id ? 'ring-4 ring-blue-400' : ''}
                    ${linkingMode && linkFrom === node.id ? 'ring-4 ring-green-400' : ''}
                  `}
                  style={{
                    borderLeftColor: getPriorityColor(node.task.priority),
                    borderLeftWidth: '4px',
                    filter: isDragging ? 'brightness(1.1)' : 'none',
                  }}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <span className="text-xs font-medium leading-tight line-clamp-4 break-words">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  {linkFrom 
                    ? '✅ Source selected! Click another task to link them' 
                    : '🔗 Linking Mode Active: Click a task to start'
                  }
                </p>
              </div>
              {linkFrom && (
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Source: {nodes.find(n => n.id === linkFrom)?.task.title}
                </p>
              )}
            </Card>
          </motion.div>
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

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (confirm(`Delete "${selectedTask.title}"?`)) {
                      // Remove all connections involving this task
                      setConnections(prev => prev.filter(conn => 
                        conn.from !== selectedTask.id && conn.to !== selectedTask.id
                      ))
                      deleteTask(selectedTask.id)
                      setSelectedNode(null)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
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