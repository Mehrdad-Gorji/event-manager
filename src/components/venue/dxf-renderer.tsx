'use client'

import React from 'react'
import { Line, Circle, Arc, Text, Group } from 'react-konva'

interface DxfEntity {
    type: string
    vertices?: { x: number; y: number }[]
    center?: { x: number; y: number }
    radius?: number
    startAngle?: number
    endAngle?: number
    text?: string
    startPoint?: { x: number; y: number }
    endPoint?: { x: number; y: number }
    position?: { x: number; y: number }
    height?: number
}

interface DxfData {
    entities?: DxfEntity[]
}

interface DxfRendererProps {
    dxfData: DxfData | null
    opacity?: number
    color?: string
    scale?: number
    offsetX?: number
    offsetY?: number
}

export function DxfRenderer({
    dxfData,
    opacity = 0.5,
    color = '#64748b',
    scale = 1,
    offsetX = 0,
    offsetY = 0
}: DxfRendererProps) {
    if (!dxfData || !dxfData.entities) return null

    const renderEntity = (entity: DxfEntity, index: number) => {
        const baseProps = {
            key: `dxf-${index}`,
            stroke: color,
            strokeWidth: 1,
            opacity,
            listening: false, // Non-interactive background
        }

        switch (entity.type) {
            case 'LINE':
                if (entity.vertices && entity.vertices.length >= 2) {
                    return (
                        <Line
                            {...baseProps}
                            points={[
                                entity.vertices[0].x * scale + offsetX,
                                -entity.vertices[0].y * scale + offsetY, // Flip Y for CAD coordinate system
                                entity.vertices[1].x * scale + offsetX,
                                -entity.vertices[1].y * scale + offsetY,
                            ]}
                        />
                    )
                }
                // Fallback for startPoint/endPoint format
                if (entity.startPoint && entity.endPoint) {
                    return (
                        <Line
                            {...baseProps}
                            points={[
                                entity.startPoint.x * scale + offsetX,
                                -entity.startPoint.y * scale + offsetY,
                                entity.endPoint.x * scale + offsetX,
                                -entity.endPoint.y * scale + offsetY,
                            ]}
                        />
                    )
                }
                return null

            case 'LWPOLYLINE':
            case 'POLYLINE':
                if (entity.vertices && entity.vertices.length > 0) {
                    const points = entity.vertices.flatMap(v => [
                        v.x * scale + offsetX,
                        -v.y * scale + offsetY,
                    ])
                    return (
                        <Line
                            {...baseProps}
                            points={points}
                            closed={false}
                        />
                    )
                }
                return null

            case 'CIRCLE':
                if (entity.center && entity.radius) {
                    return (
                        <Circle
                            {...baseProps}
                            x={entity.center.x * scale + offsetX}
                            y={-entity.center.y * scale + offsetY}
                            radius={entity.radius * scale}
                            fill="transparent"
                        />
                    )
                }
                return null

            case 'ARC':
                if (entity.center && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
                    // Convert angles from degrees to radians
                    const startAngle = (entity.startAngle * Math.PI) / 180
                    const endAngle = (entity.endAngle * Math.PI) / 180
                    const angle = endAngle - startAngle

                    return (
                        <Arc
                            {...baseProps}
                            x={entity.center.x * scale + offsetX}
                            y={-entity.center.y * scale + offsetY}
                            innerRadius={entity.radius * scale}
                            outerRadius={entity.radius * scale}
                            angle={(angle * 180) / Math.PI}
                            rotation={(-entity.startAngle)}
                            fill="transparent"
                        />
                    )
                }
                return null

            case 'TEXT':
            case 'MTEXT':
                if (entity.position && entity.text) {
                    return (
                        <Text
                            key={`dxf-${index}`}
                            x={entity.position.x * scale + offsetX}
                            y={-entity.position.y * scale + offsetY}
                            text={entity.text}
                            fontSize={(entity.height || 10) * scale}
                            fill={color}
                            opacity={opacity}
                            listening={false}
                        />
                    )
                }
                return null

            default:
                return null
        }
    }

    return (
        <Group>
            {dxfData.entities.map((entity, index) => renderEntity(entity, index))}
        </Group>
    )
}
