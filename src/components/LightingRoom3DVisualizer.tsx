import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  RotateCcw, 
  Sun, 
  Armchair, 
  Ruler, 
  Compass, 
  Sliders, 
  Gauge, 
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Plus,
  SlidersHorizontal,
  Grid,
  Eye,
  EyeOff,
  Power,
  Info,
  Settings
} from 'lucide-react';

export interface LightingRoom3DVisualizerProps {
  roomLength: number; // m (แนวยาว X)
  roomWidth: number;  // m (แนวกว้าง Y)
  roomHeight: number; // m (ความสูง Z)
  workplaneHeight: number; // m
  selectedRoomType: string;
  fixtureRows: number; // Rows along Length
  fixtureCols: number; // Cols along Width
  fixtureWatts: number;
  fixtureLumens: number;
  efficacyLmPerWatt: number;
  calculatedLux: number;
  targetLux: number;
  beamAngleText?: string;
  luminaireName?: string;
  luminaireIcon?: string;
  selectedBeamAngle?: number;
  onSelectBeamAngle?: (angle: number) => void;
  isDownlightOrSpot?: boolean;
}

export const LightingRoom3DVisualizer: React.FC<LightingRoom3DVisualizerProps> = ({
  roomLength,
  roomWidth,
  roomHeight,
  workplaneHeight,
  selectedRoomType,
  fixtureRows,
  fixtureCols,
  fixtureWatts,
  fixtureLumens,
  efficacyLmPerWatt,
  calculatedLux,
  targetLux,
  beamAngleText = '110°',
  luminaireName = 'โคมไฟส่องสว่าง',
  luminaireIcon = '💡',
  selectedBeamAngle,
  onSelectBeamAngle,
  isDownlightOrSpot = false
}) => {
  // View mode: '3d' | '2d' | 'elevation'
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'elevation'>('3d');

  // 🎛️ 0-100% Dimming / Brightness Slider State
  const [dimmingPercent, setDimmingPercent] = useState<number>(100);

  // 🔍 Zoom In / Zoom Out Controls & Fullscreen Modal State
  const [zoomLevel3D, setZoomLevel3D] = useState<number>(1.0); // 0.5x to 2.5x
  const [zoomLevel2D, setZoomLevel2D] = useState<number>(1.0); // 0.6x to 2.5x
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 3D Orbital Camera Controls
  const [rotationAngle, setRotationAngle] = useState<number>(35); // Azimuth in degrees
  const [tiltAngle, setTiltAngle] = useState<number>(32); // Elevation/Tilt in degrees
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Feature Toggles
  const [showPointLux, setShowPointLux] = useState<boolean>(true); // Show real-time Lux badges on points
  const [luxDensityMode, setLuxDensityMode] = useState<'surrounding' | 'key_points'>('surrounding'); // 'surrounding' shows all inter-fixture & perimeter points
  const [showInterFixtureLines, setShowInterFixtureLines] = useState<boolean>(true); // Show inter-fixture grid connector lines
  const [showLightCones, setShowLightCones] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [selectedFixtureIdx, setSelectedFixtureIdx] = useState<number | null>(null);

  // 📐 Fixture Spacing Mode: 'auto' (Symmetric Grid Calculation) vs 'custom' (Specify Exact Spacing in Meters)
  const [spacingMode, setSpacingMode] = useState<'auto' | 'custom'>('auto');
  const [customSpacingX, setCustomSpacingX] = useState<number>(() => Number((roomLength / Math.max(1, fixtureRows)).toFixed(2)));
  const [customSpacingY, setCustomSpacingY] = useState<number>(() => Number((roomWidth / Math.max(1, fixtureCols)).toFixed(2)));
  const [customWallSpacingX, setCustomWallSpacingX] = useState<number>(() => Number(((roomLength / Math.max(1, fixtureRows)) / 2).toFixed(2)));
  const [customWallSpacingY, setCustomWallSpacingY] = useState<number>(() => Number(((roomWidth / Math.max(1, fixtureCols)) / 2).toFixed(2)));

  // Drawer / Sub-panel toggles
  const [showSpacingDrawer, setShowSpacingDrawer] = useState<boolean>(false);
  const [showFixtureDrawer, setShowFixtureDrawer] = useState<boolean>(false);

  // 🗑️ Excluded / Deleted Specific Individual Fixtures Set
  const [deletedFixtureIds, setDeletedFixtureIds] = useState<string[]>([]);
  const [inspectedFixtureId, setInspectedFixtureId] = useState<string | null>(null);

  // Interactive Hover Lux Sensor Probe
  const [hoverProbePos, setHoverProbePos] = useState<{ x: number; y: number; lux: number } | null>(null);

  // Derived Auto Spacing Calculations
  const autoSpacingLength = roomLength / Math.max(1, fixtureRows);
  const autoSpacingWidth = roomWidth / Math.max(1, fixtureCols);
  const autoWallSpacingLength = autoSpacingLength / 2;
  const autoWallSpacingWidth = autoSpacingWidth / 2;

  // Active Spacing Values based on Mode
  const spacingLength = spacingMode === 'auto' ? autoSpacingLength : Math.max(0.1, customSpacingX);
  const spacingWidth = spacingMode === 'auto' ? autoSpacingWidth : Math.max(0.1, customSpacingY);
  const wallSpacingLength = spacingMode === 'auto' ? autoWallSpacingLength : Math.max(0.05, customWallSpacingX);
  const wallSpacingWidth = spacingMode === 'auto' ? autoWallSpacingWidth : Math.max(0.05, customWallSpacingY);

  // Dimming scaling factor
  const dimFactor = dimmingPercent / 100;

  // Beam angle parsing (extract number from 10° to 130°)
  const numericBeamAngle = useMemo(() => {
    if (selectedBeamAngle && selectedBeamAngle > 0) return selectedBeamAngle;
    const match = beamAngleText.match(/(\d+)/);
    return match ? Math.min(130, Math.max(8, parseInt(match[1], 10))) : 90;
  }, [beamAngleText, selectedBeamAngle]);

  // Generate All Fixture Slots (Both Active and Deleted)
  const allFixtures = useMemo(() => {
    const list: Array<{
      id: string;
      index: number;
      rowIdx: number;
      colIdx: number;
      x: number; // m
      y: number; // m
      z: number; // m (ceiling height)
      label: string;
      isDeleted: boolean;
      isOutOfBounds: boolean;
    }> = [];

    for (let r = 0; r < fixtureRows; r++) {
      for (let c = 0; c < fixtureCols; c++) {
        const id = `f-${r}-${c}`;
        const index = r * fixtureCols + c + 1;
        
        let x = 0;
        let y = 0;

        if (spacingMode === 'auto') {
          x = (r + 0.5) * autoSpacingLength;
          y = (c + 0.5) * autoSpacingWidth;
        } else {
          x = wallSpacingLength + r * spacingLength;
          y = wallSpacingWidth + c * spacingWidth;
        }

        const isDeleted = deletedFixtureIds.includes(id);
        const isOutOfBounds = x < 0.05 || x > roomLength - 0.05 || y < 0.05 || y > roomWidth - 0.05;

        list.push({
          id,
          index,
          rowIdx: r,
          colIdx: c,
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          z: roomHeight,
          label: `โคม #${index} (แถวยาว ${r + 1}, แถวกว้าง ${c + 1})`,
          isDeleted,
          isOutOfBounds
        });
      }
    }
    return list;
  }, [
    fixtureRows, 
    fixtureCols, 
    spacingMode, 
    autoSpacingLength, 
    autoSpacingWidth, 
    spacingLength, 
    spacingWidth, 
    wallSpacingLength, 
    wallSpacingWidth, 
    roomLength, 
    roomWidth, 
    roomHeight, 
    deletedFixtureIds
  ]);

  // Active luminaires emitting light (excluding deleted or out-of-bounds fixtures)
  const fixtures3D = useMemo(() => {
    return allFixtures.filter(f => !f.isDeleted && !f.isOutOfBounds);
  }, [allFixtures]);

  const totalGridFixtures = allFixtures.length;
  const activeFixturesCount = fixtures3D.length;
  const deletedCount = deletedFixtureIds.length;

  // Scaled Real-Time Photometric Power & Lumens based on active fixtures & dimming
  const scaledCalculatedLux = totalGridFixtures > 0 ? Math.round(calculatedLux * (activeFixturesCount / totalGridFixtures)) : 0;
  const currentEffectiveLux = Math.round(scaledCalculatedLux * dimFactor);
  const currentEffectiveLumens = Math.round(activeFixturesCount * fixtureLumens * dimFactor);
  const currentEffectiveWatts = (activeFixturesCount * fixtureWatts * dimFactor).toFixed(1);

  // Toggle individual fixture active/deleted state
  const toggleFixtureDeleted = (id: string) => {
    setDeletedFixtureIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Restore all fixtures
  const restoreAllFixtures = () => {
    setDeletedFixtureIds([]);
  };

  // Auto-center custom spacing in the room
  const autoCenterCustomSpacing = () => {
    if (fixtureRows <= 1) {
      setCustomWallSpacingX(Number((roomLength / 2).toFixed(2)));
    } else {
      const spanX = (fixtureRows - 1) * customSpacingX;
      const wallX = Math.max(0.1, (roomLength - spanX) / 2);
      setCustomWallSpacingX(Number(wallX.toFixed(2)));
    }
    if (fixtureCols <= 1) {
      setCustomWallSpacingY(Number((roomWidth / 2).toFixed(2)));
    } else {
      const spanY = (fixtureCols - 1) * customSpacingY;
      const wallY = Math.max(0.1, (roomWidth - spanY) / 2);
      setCustomWallSpacingY(Number(wallY.toFixed(2)));
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (viewMode === '3d') {
      setZoomLevel3D((prev) => Math.min(2.5, Number((prev + 0.2).toFixed(1))));
    } else {
      setZoomLevel2D((prev) => Math.min(2.5, Number((prev + 0.2).toFixed(1))));
    }
  };

  const handleZoomOut = () => {
    if (viewMode === '3d') {
      setZoomLevel3D((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(1))));
    } else {
      setZoomLevel2D((prev) => Math.max(0.6, Number((prev - 0.2).toFixed(1))));
    }
  };

  const handleResetZoom = () => {
    setZoomLevel3D(1.0);
    setZoomLevel2D(1.0);
    setRotationAngle(35);
    setTiltAngle(32);
  };

  // Handle Drag-to-Rotate for 3D View
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== '3d') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotationAngle((prev) => (prev + deltaX * 0.6) % 360);
    setTiltAngle((prev) => Math.max(10, Math.min(75, prev - deltaY * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 3D Isometric Math Projection Helper
  const project3D = (
    x: number,
    y: number,
    z: number,
    canvasW: number = 750,
    canvasH: number = 440
  ) => {
    const cx = canvasW / 2;
    const cy = canvasH / 2 + 30;

    const ox = x - roomLength / 2;
    const oy = y - roomWidth / 2;
    const oz = z;

    const radRot = (rotationAngle * Math.PI) / 180;
    const radTilt = (tiltAngle * Math.PI) / 180;

    const rx = ox * Math.cos(radRot) - oy * Math.sin(radRot);
    const ry = ox * Math.sin(radRot) + oy * Math.cos(radRot);

    const maxDim = Math.max(roomLength, roomWidth, roomHeight * 1.3, 5);
    const scale = (Math.min(canvasW, canvasH) * 0.46 * zoomLevel3D) / maxDim;

    const px = cx + rx * scale;
    const py = cy + (ry * Math.sin(radTilt) - oz * Math.cos(radTilt)) * scale;

    return { px, py, scale };
  };

  // 🧮 Accurate Photometric Point-by-Point Lux Calculator Engine
  const calculatePointLux = (x: number, y: number, z: number = workplaneHeight): number => {
    if (dimmingPercent === 0) return 0;

    const radBeamHalf = ((numericBeamAngle / 2) * Math.PI) / 180;
    const n = Math.max(1, -Math.log(2) / Math.log(Math.max(0.01, Math.cos(radBeamHalf))));

    let totalDirectLux = 0;
    fixtures3D.forEach((f) => {
      const dx = x - f.x;
      const dy = y - f.y;
      const dz = f.z - z;
      const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist3D < 0.05) return;

      const cosTheta = Math.max(0, dz / dist3D);
      const I0 = (fixtureLumens / (2 * Math.PI * (1 - Math.cos(radBeamHalf)))) * 1.15;
      const intensityAtAngle = I0 * Math.pow(cosTheta, n);
      const luxFromFixture = (intensityAtAngle * cosTheta) / (dist3D * dist3D);
      totalDirectLux += luxFromFixture;
    });

    const distToWall = Math.min(x, roomLength - x, y, roomWidth - y);
    const wallBounceFactor = Math.min(1.0, 0.65 + 0.35 * (distToWall / 1.5));
    const roomIndirectLux = calculatedLux * 0.28 * wallBounceFactor;

    const rawLux = (totalDirectLux * 0.72 + roomIndirectLux) * dimFactor;
    return Math.max(0, Math.round(rawLux));
  };

  // Furniture Definitions based on Room Preset
  const furnitureItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: string;
      x: number; // m
      y: number; // m
      z: number; // m
      w: number; // m along X
      d: number; // m along Y
      h: number; // m along Z
      color: string;
      label: string;
      icon: string;
    }> = [];

    const L = roomLength;
    const W = roomWidth;

    if (selectedRoomType.startsWith('office')) {
      const deskW = Math.min(1.6, L * 0.28);
      const deskD = Math.min(0.9, W * 0.24);
      const deskH = 0.75;

      items.push({
        id: 'desk-1',
        name: 'โต๊ะทำงาน 1 (Workstation A)',
        type: 'desk',
        x: L * 0.25 - deskW / 2,
        y: W * 0.3 - deskD / 2,
        z: 0,
        w: deskW,
        d: deskD,
        h: deskH,
        color: '#475569',
        label: 'โต๊ะทำงาน A + จอภาพ',
        icon: '💻'
      });

      items.push({
        id: 'desk-2',
        name: 'โต๊ะทำงาน 2 (Workstation B)',
        type: 'desk',
        x: L * 0.75 - deskW / 2,
        y: W * 0.3 - deskD / 2,
        z: 0,
        w: deskW,
        d: deskD,
        h: deskH,
        color: '#475569',
        label: 'โต๊ะทำงาน B + จอภาพ',
        icon: '💻'
      });

      if (L >= 4 && W >= 4) {
        items.push({
          id: 'office-meeting',
          name: 'โต๊ะประชุมย่อย (Discussion Table)',
          type: 'table',
          x: L * 0.5 - 0.7,
          y: W * 0.75 - 0.6,
          z: 0,
          w: 1.4,
          d: 1.2,
          h: 0.75,
          color: '#334155',
          label: 'โต๊ะประชุมย่อย 4 ที่นั่ง',
          icon: '👥'
        });
      }

      items.push({
        id: 'cabinet-1',
        name: 'ตู้เอกสาร (Filing Cabinet)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.8 - 0.5,
        z: 0,
        w: 0.5,
        d: 1.0,
        h: 1.4,
        color: '#1e293b',
        label: 'ตู้เอกสารสูง 1.4m',
        icon: '🗄️'
      });
    } else if (selectedRoomType.startsWith('meeting')) {
      const tableW = Math.max(1.8, L * 0.55);
      const tableD = Math.max(1.1, W * 0.45);
      const tableH = 0.75;

      items.push({
        id: 'conf-table',
        name: 'โต๊ะประชุมหลัก (Conference Board Table)',
        type: 'table',
        x: L / 2 - tableW / 2,
        y: W / 2 - tableD / 2,
        z: 0,
        w: tableW,
        d: tableD,
        h: tableH,
        color: '#3b82f6',
        label: 'โต๊ะประชุมใหญ่ 8-12 ที่นั่ง',
        icon: '👥'
      });

      items.push({
        id: 'pres-screen',
        name: 'จอพรีเซนต์ 85" / Whiteboard',
        type: 'screen',
        x: L / 2 - 1.0,
        y: 0.05,
        z: 1.1,
        w: 2.0,
        d: 0.1,
        h: 1.1,
        color: '#0f172a',
        label: 'จอ Smart TV 85" หน้าห้อง',
        icon: '📺'
      });

      items.push({
        id: 'side-credenza',
        name: 'ตู้เบรคกาแฟ (Coffee Credenza)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.5 - 0.7,
        z: 0,
        w: 0.6,
        d: 1.4,
        h: 0.85,
        color: '#1e293b',
        label: 'เคาน์เตอร์กาแฟ & เครื่องดื่ม',
        icon: '☕'
      });
    } else if (selectedRoomType.startsWith('warehouse')) {
      const rackW = Math.min(1.2, L * 0.28);
      const rackD = Math.max(1.5, W * 0.65);
      const rackH = Math.min(roomHeight * 0.7, 4.0);

      items.push({
        id: 'rack-1',
        name: 'ชั้นวางพาเลทอุตสาหกรรม Rack A',
        type: 'rack',
        x: L * 0.22 - rackW / 2,
        y: W * 0.5 - rackD / 2,
        z: 0,
        w: rackW,
        d: rackD,
        h: rackH,
        color: '#eab308',
        label: `Pallet Heavy Rack A (${rackH.toFixed(1)}m)`,
        icon: '📦'
      });

      items.push({
        id: 'rack-2',
        name: 'ชั้นวางพาเลทอุตสาหกรรม Rack B',
        type: 'rack',
        x: L * 0.78 - rackW / 2,
        y: W * 0.5 - rackD / 2,
        z: 0,
        w: rackW,
        d: rackD,
        h: rackH,
        color: '#eab308',
        label: `Pallet Heavy Rack B (${rackH.toFixed(1)}m)`,
        icon: '📦'
      });

      items.push({
        id: 'pallet-floor',
        name: 'กองสินค้าบนพาเลทไม้ (Staged Pallets)',
        type: 'pallet',
        x: L * 0.5 - 0.6,
        y: W * 0.5 - 0.6,
        z: 0,
        w: 1.2,
        d: 1.2,
        h: 0.9,
        color: '#b45309',
        label: 'พาเลทสินค้าเตรียมจัดส่ง',
        icon: '🪵'
      });
    } else if (selectedRoomType.startsWith('retail')) {
      const gondolaW = Math.max(1.2, L * 0.35);
      const gondolaD = 0.8;
      const gondolaH = 1.4;

      items.push({
        id: 'gondola-1',
        name: 'เชลฟ์โชว์สินค้า Gondola Shelf A',
        type: 'shelf',
        x: L * 0.3 - gondolaW / 2,
        y: W * 0.5 - gondolaD / 2,
        z: 0,
        w: gondolaW,
        d: gondolaD,
        h: gondolaH,
        color: '#ec4899',
        label: 'ชั้นวางสินค้ากลางร้าน A',
        icon: '🛍️'
      });

      items.push({
        id: 'gondola-2',
        name: 'เชลฟ์โชว์สินค้า Gondola Shelf B',
        type: 'shelf',
        x: L * 0.7 - gondolaW / 2,
        y: W * 0.5 - gondolaD / 2,
        z: 0,
        w: gondolaW,
        d: gondolaD,
        h: gondolaH,
        color: '#ec4899',
        label: 'ชั้นวางสินค้ากลางร้าน B',
        icon: '🛍️'
      });

      items.push({
        id: 'cashier-counter',
        name: 'เคาน์เตอร์คิดเงิน (POS Cashier)',
        type: 'counter',
        x: L * 0.5 - 0.75,
        y: W * 0.85 - 0.4,
        z: 0,
        w: 1.5,
        d: 0.8,
        h: 0.95,
        color: '#0284c7',
        label: 'เคาน์เตอร์ชำระเงิน POS',
        icon: '💳'
      });
    } else if (selectedRoomType.startsWith('residential_living')) {
      const sofaW = Math.max(1.8, L * 0.45);
      const sofaD = 0.9;
      const sofaH = 0.8;

      items.push({
        id: 'sofa-main',
        name: 'โซฟาพักผ่อน (3-Seater Comfort Sofa)',
        type: 'sofa',
        x: L * 0.5 - sofaW / 2,
        y: W * 0.7 - sofaD / 2,
        z: 0,
        w: sofaW,
        d: sofaD,
        h: sofaH,
        color: '#059669',
        label: 'โซฟา 3 ที่นั่งโมเดิร์น',
        icon: '🛋️'
      });

      items.push({
        id: 'coffee-table',
        name: 'โต๊ะกลางกาแฟ (Coffee Table)',
        type: 'table',
        x: L * 0.5 - 0.6,
        y: W * 0.45 - 0.4,
        z: 0,
        w: 1.2,
        d: 0.8,
        h: 0.45,
        color: '#d97706',
        label: 'โต๊ะกลางลายไม้โมเดิร์น',
        icon: '☕'
      });

      items.push({
        id: 'tv-unit',
        name: 'ตู้วางทีวี (TV Media Console)',
        type: 'cabinet',
        x: L * 0.5 - 1.0,
        y: 0.15,
        z: 0,
        w: 2.0,
        d: 0.5,
        h: 0.55,
        color: '#1e293b',
        label: 'ชั้นวางทีวี 65" + ซาวด์บาร์',
        icon: '📺'
      });
    } else if (selectedRoomType.startsWith('residential_bed')) {
      const bedW = Math.max(1.8, L * 0.4);
      const bedD = Math.max(2.0, W * 0.5);
      const bedH = 0.65;

      items.push({
        id: 'bed-king',
        name: 'เตียงนอนขนาดคิงไซส์ (King Size Bed)',
        type: 'bed',
        x: L * 0.5 - bedW / 2,
        y: W * 0.4 - bedD / 2,
        z: 0,
        w: bedW,
        d: bedD,
        h: bedH,
        color: '#6366f1',
        label: 'เตียง King Size 6 ฟุต + หมอน',
        icon: '🛏️'
      });

      items.push({
        id: 'wardrobe',
        name: 'ตู้เสื้อผ้าบิวท์อิน (Wardrobe Closet)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.6 - 0.75,
        z: 0,
        w: 0.6,
        d: 1.5,
        h: 2.2,
        color: '#334155',
        label: 'ตู้เสื้อผ้าสูง 2.2m',
        icon: '🚪'
      });
    } else if (selectedRoomType.startsWith('drawing')) {
      const draftW = Math.max(1.5, L * 0.35);
      const draftD = 1.0;
      const draftH = 0.95;

      items.push({
        id: 'drafting-desk-1',
        name: 'โต๊ะเขียนแบบสถาปัตย์ โต๊ะ 1',
        type: 'desk',
        x: L * 0.3 - draftW / 2,
        y: W * 0.5 - draftD / 2,
        z: 0,
        w: draftW,
        d: draftD,
        h: draftH,
        color: '#0284c7',
        label: 'โต๊ะเขียนแบบขนาด A0 ปรับเอียง',
        icon: '📐'
      });

      items.push({
        id: 'drafting-desk-2',
        name: 'โต๊ะเขียนแบบสถาปัตย์ โต๊ะ 2',
        type: 'desk',
        x: L * 0.7 - draftW / 2,
        y: W * 0.5 - draftD / 2,
        z: 0,
        w: draftW,
        d: draftD,
        h: draftH,
        color: '#0284c7',
        label: 'โต๊ะเขียนแบบขนาด A0 โต๊ะ 2',
        icon: '📐'
      });
    } else if (selectedRoomType.startsWith('corridor')) {
      items.push({
        id: 'runner-carpet',
        name: 'พรมทางเดินแนวเส้นตรง (Corridor Carpet)',
        type: 'rug',
        x: 0.4,
        y: W / 2 - 0.4,
        z: 0.01,
        w: L - 0.8,
        d: 0.8,
        h: 0.02,
        color: '#be123c',
        label: 'พรมปูทางเดินสัญจร',
        icon: '🚪'
      });
    } else {
      items.push({
        id: 'gen-table',
        name: 'โต๊ะทำงานและพื้นที่ใช้งานอเนกประสงค์',
        type: 'table',
        x: L / 2 - 1.0,
        y: W / 2 - 0.75,
        z: 0,
        w: 2.0,
        d: 1.5,
        h: 0.75,
        color: '#475569',
        label: 'โต๊ะทำงานส่วนกลาง',
        icon: '🪑'
      });
    }

    return items;
  }, [selectedRoomType, roomLength, roomWidth, roomHeight]);

  // 📍 Sample Key Points for Lux Display across Room Grid (Surrounding Luminaires in All Directions)
  const sampleLuxPoints = useMemo(() => {
    const points: Array<{
      id: string;
      x: number;
      y: number;
      z: number;
      label: string;
      subLabel: string;
      lux: number;
      type: 'under_fixture' | 'mid_row_x' | 'mid_col_y' | 'quad_center' | 'perimeter' | 'corner' | 'center' | 'furniture';
      icon: string;
    }> = [];

    // Helper to avoid overlapping points at almost identical (x,y)
    const isDuplicate = (x: number, y: number) => {
      return points.some((p) => Math.abs(p.x - x) < 0.12 && Math.abs(p.y - y) < 0.12);
    };

    // 1. ⚡ Direct Under Active Luminaire Points (Nadir Lux - Peak intensity under each fixture)
    fixtures3D.forEach((f) => {
      points.push({
        id: `under-${f.id}`,
        x: f.x,
        y: f.y,
        z: workplaneHeight,
        label: `ใต้โคม #${f.index}`,
        subLabel: `Nadir (${f.x.toFixed(2)}m, ${f.y.toFixed(2)}m)`,
        lux: calculatePointLux(f.x, f.y, workplaneHeight),
        type: 'under_fixture',
        icon: '⚡'
      });
    });

    // 2. ↔ Midpoints Between Adjacent Luminaires along Length / X-axis
    if (fixtureRows > 1) {
      for (let r = 0; r < fixtureRows - 1; r++) {
        for (let c = 0; c < fixtureCols; c++) {
          const f1 = allFixtures.find(f => f.rowIdx === r && f.colIdx === c);
          const f2 = allFixtures.find(f => f.rowIdx === r + 1 && f.colIdx === c);
          if (f1 && f2 && (!f1.isOutOfBounds || !f2.isOutOfBounds)) {
            const mx = Number(((f1.x + f2.x) / 2).toFixed(2));
            const my = Number(((f1.y + f2.y) / 2).toFixed(2));
            if (!isDuplicate(mx, my)) {
              points.push({
                id: `mid-x-${r}-${c}`,
                x: mx,
                y: my,
                z: workplaneHeight,
                label: `ระหว่างโคมแนวยาว`,
                subLabel: `#${f1.index} ↔ #${f2.index}`,
                lux: calculatePointLux(mx, my, workplaneHeight),
                type: 'mid_row_x',
                icon: '↔'
              });
            }
          }
        }
      }
    }

    // 3. ↕ Midpoints Between Adjacent Luminaires along Width / Y-axis
    if (fixtureCols > 1) {
      for (let r = 0; r < fixtureRows; r++) {
        for (let c = 0; c < fixtureCols - 1; c++) {
          const f1 = allFixtures.find(f => f.rowIdx === r && f.colIdx === c);
          const f2 = allFixtures.find(f => f.rowIdx === r && f.colIdx === c + 1);
          if (f1 && f2 && (!f1.isOutOfBounds || !f2.isOutOfBounds)) {
            const mx = Number(((f1.x + f2.x) / 2).toFixed(2));
            const my = Number(((f1.y + f2.y) / 2).toFixed(2));
            if (!isDuplicate(mx, my)) {
              points.push({
                id: `mid-y-${r}-${c}`,
                x: mx,
                y: my,
                z: workplaneHeight,
                label: `ระหว่างโคมแนวกว้าง`,
                subLabel: `#${f1.index} ↕ #${f2.index}`,
                lux: calculatePointLux(mx, my, workplaneHeight),
                type: 'mid_col_y',
                icon: '↕'
              });
            }
          }
        }
      }
    }

    // 4. ✛ Quad Intersections (Center point between 4 surrounding fixtures)
    if (fixtureRows > 1 && fixtureCols > 1) {
      for (let r = 0; r < fixtureRows - 1; r++) {
        for (let c = 0; c < fixtureCols - 1; c++) {
          const f1 = allFixtures.find(f => f.rowIdx === r && f.colIdx === c);
          const f2 = allFixtures.find(f => f.rowIdx === r + 1 && f.colIdx === c + 1);
          if (f1 && f2) {
            const mx = Number(((f1.x + f2.x) / 2).toFixed(2));
            const my = Number(((f1.y + f2.y) / 2).toFixed(2));
            if (!isDuplicate(mx, my) && mx > 0 && mx < roomLength && my > 0 && my < roomWidth) {
              points.push({
                id: `quad-${r}-${c}`,
                x: mx,
                y: my,
                z: workplaneHeight,
                label: `กึ่งกลาง 4 โคม`,
                subLabel: `Quad Center (R${r + 1}-${r + 2}, C${c + 1}-${c + 2})`,
                lux: calculatePointLux(mx, my, workplaneHeight),
                type: 'quad_center',
                icon: '✛'
              });
            }
          }
        }
      }
    }

    // 5. ▫ Perimeter Points Around Fixtures (North, South, East, West between outer fixtures & walls)
    if (luxDensityMode === 'surrounding') {
      // Left & Right Wall Perimeters
      for (let c = 0; c < fixtureCols; c++) {
        const leftX = Number((wallSpacingLength * 0.5).toFixed(2));
        const rightX = Number((roomLength - wallSpacingLength * 0.5).toFixed(2));
        const refF = allFixtures.find(f => f.colIdx === c);
        const my = refF ? refF.y : (c + 0.5) * spacingWidth;

        if (!isDuplicate(leftX, my) && leftX > 0 && leftX < roomLength) {
          points.push({
            id: `perim-left-${c}`,
            x: leftX,
            y: my,
            z: workplaneHeight,
            label: `ริมผนังซ้ายรอบโคม`,
            subLabel: `Wall-Left (C${c + 1})`,
            lux: calculatePointLux(leftX, my, workplaneHeight),
            type: 'perimeter',
            icon: '▫'
          });
        }

        if (!isDuplicate(rightX, my) && rightX > 0 && rightX < roomLength) {
          points.push({
            id: `perim-right-${c}`,
            x: rightX,
            y: my,
            z: workplaneHeight,
            label: `ริมผนังขวารอบโคม`,
            subLabel: `Wall-Right (C${c + 1})`,
            lux: calculatePointLux(rightX, my, workplaneHeight),
            type: 'perimeter',
            icon: '▫'
          });
        }
      }

      // Top & Bottom Wall Perimeters
      for (let r = 0; r < fixtureRows; r++) {
        const topY = Number((wallSpacingWidth * 0.5).toFixed(2));
        const botY = Number((roomWidth - wallSpacingWidth * 0.5).toFixed(2));
        const refF = allFixtures.find(f => f.rowIdx === r);
        const mx = refF ? refF.x : (r + 0.5) * spacingLength;

        if (!isDuplicate(mx, topY) && topY > 0 && topY < roomWidth) {
          points.push({
            id: `perim-top-${r}`,
            x: mx,
            y: topY,
            z: workplaneHeight,
            label: `ริมผนังบนรอบโคม`,
            subLabel: `Wall-Top (R${r + 1})`,
            lux: calculatePointLux(mx, topY, workplaneHeight),
            type: 'perimeter',
            icon: '▫'
          });
        }

        if (!isDuplicate(mx, botY) && botY > 0 && botY < roomWidth) {
          points.push({
            id: `perim-bot-${r}`,
            x: mx,
            y: botY,
            z: workplaneHeight,
            label: `ริมผนังล่างรอบโคม`,
            subLabel: `Wall-Bottom (R${r + 1})`,
            lux: calculatePointLux(mx, botY, workplaneHeight),
            type: 'perimeter',
            icon: '▫'
          });
        }
      }
    }

    // 6. ◤ Four Corners of Room
    const cornerInsetX = Math.min(0.6, Math.max(0.25, wallSpacingLength * 0.5));
    const cornerInsetY = Math.min(0.6, Math.max(0.25, wallSpacingWidth * 0.5));
    [
      { x: cornerInsetX, y: cornerInsetY, lbl: 'มุมห้อง 1 (NW)', sub: 'Top-Left Corner' },
      { x: roomLength - cornerInsetX, y: cornerInsetY, lbl: 'มุมห้อง 2 (NE)', sub: 'Top-Right Corner' },
      { x: cornerInsetX, y: roomWidth - cornerInsetY, lbl: 'มุมห้อง 3 (SW)', sub: 'Bottom-Left Corner' },
      { x: roomLength - cornerInsetX, y: roomWidth - cornerInsetY, lbl: 'มุมห้อง 4 (SE)', sub: 'Bottom-Right Corner' }
    ].forEach((c, idx) => {
      if (!isDuplicate(c.x, c.y)) {
        points.push({
          id: `corner-${idx}`,
          x: c.x,
          y: c.y,
          z: workplaneHeight,
          label: c.lbl,
          subLabel: c.sub,
          lux: calculatePointLux(c.x, c.y, workplaneHeight),
          type: 'corner',
          icon: '◤'
        });
      }
    });

    // 7. ◎ Room Center Point
    const centerX = roomLength / 2;
    const centerY = roomWidth / 2;
    if (!isDuplicate(centerX, centerY)) {
      points.push({
        id: 'center-room',
        x: centerX,
        y: centerY,
        z: workplaneHeight,
        label: 'กึ่งกลางห้อง',
        subLabel: 'Room Center',
        lux: calculatePointLux(centerX, centerY, workplaneHeight),
        type: 'center',
        icon: '◎'
      });
    }

    // 8. 🪑 Furniture Surface Points (if visible)
    if (showFurniture) {
      furnitureItems.slice(0, 2).forEach((furn) => {
        const fx = furn.x + furn.w / 2;
        const fy = furn.y + furn.d / 2;
        const fz = furn.z + furn.h;
        if (!isDuplicate(fx, fy)) {
          points.push({
            id: `furn-${furn.id}`,
            x: fx,
            y: fy,
            z: fz,
            label: `บน${furn.name.split(' ')[0]}`,
            subLabel: `Work Surface (H=${fz.toFixed(2)}m)`,
            lux: calculatePointLux(fx, fy, fz),
            type: 'furniture',
            icon: '🪑'
          });
        }
      });
    }

    return points;
  }, [
    fixtures3D,
    allFixtures,
    fixtureRows,
    fixtureCols,
    spacingLength,
    spacingWidth,
    wallSpacingLength,
    wallSpacingWidth,
    roomLength,
    roomWidth,
    workplaneHeight,
    furnitureItems,
    showFurniture,
    luxDensityMode,
    dimmingPercent,
    calculatedLux,
    numericBeamAngle,
    fixtureLumens,
    dimFactor
  ]);

  // 📊 Point Photometric Metrics (Min, Max, Avg, Uniformity Ratio U0 = Emin / Eavg)
  const luxStats = useMemo(() => {
    if (sampleLuxPoints.length === 0) return { min: 0, max: 0, avg: 0, uniformity: '0.00', underAvg: 0, interAvg: 0 };
    const luxValues = sampleLuxPoints.map((p) => p.lux);
    const min = Math.min(...luxValues);
    const max = Math.max(...luxValues);
    const avg = Math.round(luxValues.reduce((a, b) => a + b, 0) / luxValues.length);
    const uniformity = avg > 0 ? (min / avg).toFixed(2) : '0.00';

    const underPts = sampleLuxPoints.filter((p) => p.type === 'under_fixture');
    const underAvg = underPts.length > 0 ? Math.round(underPts.reduce((a, b) => a + b.lux, 0) / underPts.length) : 0;

    const interPts = sampleLuxPoints.filter((p) => p.type === 'mid_row_x' || p.type === 'mid_col_y' || p.type === 'quad_center');
    const interAvg = interPts.length > 0 ? Math.round(interPts.reduce((a, b) => a + b.lux, 0) / interPts.length) : 0;

    return { min, max, avg, uniformity, underAvg, interAvg };
  }, [sampleLuxPoints]);

  // SVG Dimension Line Component for 2D View
  const renderDimensionLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string,
    offset: number = 0,
    isVertical: boolean = false
  ) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
      <g className="select-none font-mono text-[9px]">
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        <line
          x1={isVertical ? x1 - 3 : x1}
          y1={isVertical ? y1 : y1 - 3}
          x2={isVertical ? x1 + 3 : x1}
          y2={isVertical ? y1 : y1 + 3}
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        <line
          x1={isVertical ? x2 - 3 : x2}
          y1={isVertical ? y2 : y2 - 3}
          x2={isVertical ? x2 + 3 : x2}
          y2={isVertical ? y2 : y2 + 3}
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        <rect
          x={isVertical ? midX - 22 : midX - 20}
          y={isVertical ? midY - 6 : midY - 6}
          width={isVertical ? 44 : 40}
          height="12"
          fill="#090d16"
          rx="2"
          stroke="#0284c7"
          strokeWidth="0.5"
        />

        <text
          x={midX}
          y={midY + 3}
          fill="#38bdf8"
          fontWeight="bold"
          textAnchor="middle"
        >
          {text}
        </text>
      </g>
    );
  };

  // Reusable Floating Dimming Slider Component (Rendered inside 2D, 3D & Fullscreen canvases)
  const renderInCanvasDimmingSlider = () => (
    <div className="absolute top-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 shadow-2xl flex flex-col gap-1.5 w-64 md:w-72 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>ปรับแสงสว่าง ({dimmingPercent}%)</span>
        </span>
        <span className="font-mono font-black text-emerald-400 text-xs">
          {currentEffectiveLux} Lux
        </span>
      </div>

      {/* Range Slider Track */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={dimmingPercent}
          onChange={(e) => setDimmingPercent(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #fbbf24 ${dimmingPercent}%, #334155 ${dimmingPercent}%, #334155 100%)`
          }}
        />
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-between text-[10px] pt-0.5">
        <button
          type="button"
          onClick={() => setDimmingPercent(0)}
          className={`px-1.5 py-0.5 rounded transition ${dimmingPercent === 0 ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          0% (ปิด)
        </button>
        <button
          type="button"
          onClick={() => setDimmingPercent(25)}
          className={`px-1.5 py-0.5 rounded transition ${dimmingPercent === 25 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => setDimmingPercent(50)}
          className={`px-1.5 py-0.5 rounded transition ${dimmingPercent === 50 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => setDimmingPercent(75)}
          className={`px-1.5 py-0.5 rounded transition ${dimmingPercent === 75 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          75%
        </button>
        <button
          type="button"
          onClick={() => setDimmingPercent(100)}
          className={`px-1.5 py-0.5 rounded transition ${dimmingPercent === 100 ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          100% (เต็ม)
        </button>
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl bg-slate-950 border border-slate-800 text-white overflow-hidden shadow-2xl transition-all duration-200 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none flex flex-col' : 'relative space-y-0'}`}>
      
      {/* 🎛️ Top Main Dimming Ribbon (Integrated for all screens) */}
      <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 space-y-2.5">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  ปรับหรี่ความสว่างแสงสว่าง (Dimming Control):
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-xs">
                  {dimmingPercent}%
                </span>
                {dimmingPercent === 0 ? (
                  <span className="text-[10px] text-rose-400 font-bold">(🔴 ปิดไฟ)</span>
                ) : dimmingPercent === 100 ? (
                  <span className="text-[10px] text-emerald-400 font-bold">(⚡ 100% เต็มกำลัง)</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">ความสว่างเฉลี่ย:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {currentEffectiveLux} Lux
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">กำลังไฟ:</span>
              <span className="font-mono font-bold text-white">
                {currentEffectiveWatts} W
              </span>
            </div>
          </div>
        </div>

        {/* Range Slider Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500 w-8">0%</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={dimmingPercent}
              onChange={(e) => setDimmingPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #fbbf24 ${dimmingPercent}%, #1e293b ${dimmingPercent}%, #1e293b 100%)`
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-bold w-10 text-right">100%</span>
        </div>

      </div>

      {/* Visualizer Toolbar: Mode Tabs, Zoom In/Out, Fullscreen & Toggles */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D จำลองห้อง & ค่า Lux</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D ผังเพดาน & Lux แต่ละจุด</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('elevation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'elevation'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>รูปตัด (Elevation)</span>
          </button>
        </div>

        {/* Center: 🔍 Zoom In / Out Controls & Reset */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1"
            title="ย่อขนาดภาพ (Zoom Out -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">ย่อ</span>
          </button>

          <span className="px-2 font-mono text-[11px] font-bold text-amber-400">
            {Math.round((viewMode === '3d' ? zoomLevel3D : zoomLevel2D) * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1"
            title="ขยายขนาดภาพ (Zoom In +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">ขยาย</span>
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="รีเซ็ตขนาดซูม (Reset 100%)"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* Right: Feature Toggles & Fullscreen Button */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          
          {/* Lux Badges Main Toggle */}
          <button
            type="button"
            onClick={() => setShowPointLux(!showPointLux)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              showPointLux
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิด การแสดงตัวเลขค่า Lux จริงในแต่ละจุดผัง"
          >
            <Gauge className="w-3 h-3" />
            <span>ค่า Lux ({sampleLuxPoints.length} จุด)</span>
          </button>

          {/* Lux Density Selector: Surrounding All vs Key Points */}
          {showPointLux && (
            <button
              type="button"
              onClick={() => setLuxDensityMode(luxDensityMode === 'surrounding' ? 'key_points' : 'surrounding')}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                luxDensityMode === 'surrounding'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="สลับโหมด: แสดงค่า Lux ระหว่างโคมรอบตัวทุกทิศทาง หรือเฉพาะจุดหลัก"
            >
              <span>{luxDensityMode === 'surrounding' ? '🌐 รอบโคมทุกจุด' : '🎯 จุดหลัก'}</span>
            </button>
          )}

          {/* 2D Inter-fixture Guide Lines Toggle */}
          {viewMode === '2d' && (
            <button
              type="button"
              onClick={() => setShowInterFixtureLines(!showInterFixtureLines)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition flex items-center gap-1 cursor-pointer ${
                showInterFixtureLines
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="เปิด/ปิด เส้นโยงโครงข่ายการกระจายแสงระหว่างโคม"
            >
              <span>เส้นโยงผัง</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLightCones(!showLightCones)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
              showLightCones
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>กรวยแสง</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFurniture(!showFurniture)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
              showFurniture
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Armchair className="w-3 h-3" />
            <span>เฟอร์นิเจอร์</span>
          </button>

          {/* 🔲 Fullscreen / Expand Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              isFullscreen
                ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={isFullscreen ? 'ย่อกลับสู่ขนาดปกติ (Exit Fullscreen)' : 'ขยายเต็มหน้าจอ (Expand Fullscreen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">ย่อหน้าต่าง</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">ขยายเต็มจอ</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* 🎯 Quick Downlight / Spotlight Beam Angle Switcher Sub-Bar (10°, 15°, 20°, 25°, 36°, 40°, 50°, 55°, 60°) */}
      {(isDownlightOrSpot || onSelectBeamAngle) && (
        <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>ปรับองศามุมโคมดาวน์ไลท์ (Beam Angle):</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono font-black text-[11px]">
              {numericBeamAngle}° {numericBeamAngle <= 20 ? 'Narrow Spot' : numericBeamAngle <= 36 ? 'Medium Spot/Flood' : 'Wide Flood'}
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {[10, 15, 20, 25, 36, 40, 50, 55, 60].map((deg) => {
              const isActive = numericBeamAngle === deg;
              return (
                <button
                  key={`beam-deg-${deg}`}
                  type="button"
                  onClick={() => onSelectBeamAngle && onSelectBeamAngle(deg)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                  title={`เลือกมุมกระจายแสง ${deg}°`}
                >
                  {deg}°
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 📐 Fixture Spacing Mode (Auto vs Custom) & Individual Fixture Manager Ribbon */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Spacing Mode (Auto vs Custom) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>ระยะติดตั้งโคมไฟ:</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSpacingMode('auto');
                setShowSpacingDrawer(false);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                spacingMode === 'auto'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto ({autoSpacingLength.toFixed(2)}m × {autoSpacingWidth.toFixed(2)}m)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSpacingMode('custom');
                setShowSpacingDrawer(true);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                spacingMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>กำหนดระยะเอง ({spacingLength.toFixed(2)}m × {spacingWidth.toFixed(2)}m)</span>
            </button>
          </div>

          {spacingMode === 'custom' && (
            <button
              type="button"
              onClick={() => setShowSpacingDrawer(!showSpacingDrawer)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>{showSpacingDrawer ? 'ซ่อนตั้งค่าระยะ' : 'ปรับระยะห่าง'}</span>
            </button>
          )}
        </div>

        {/* Right: Fixture Active Matrix & Deletion Summary */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFixtureDrawer(!showFixtureDrawer)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              deletedCount > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
            title="เปิดแผงจัดการโคมไฟ / ตรวจสอบโคมที่ถูกลบออก"
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span>โคมในแบบ:</span>
            <span className="font-mono text-amber-400">{activeFixturesCount}/{totalGridFixtures}</span>
            {deletedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                ลบออก {deletedCount}
              </span>
            )}
          </button>

          {deletedCount > 0 && (
            <button
              type="button"
              onClick={restoreAllFixtures}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="คืนค่าโคมไฟทั้งหมดให้กลับมาครบทุกจุด"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>กู้คืนทั้งหมด</span>
            </button>
          )}
        </div>

      </div>

      {/* 🛠️ Custom Spacing Configuration Drawer (Expandable) */}
      {spacingMode === 'custom' && showSpacingDrawer && (
        <div className="p-3.5 bg-slate-900/95 border-b border-amber-500/30 text-xs animate-in slide-in-from-top duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <SlidersHorizontal className="w-4 h-4" />
              <span>กำหนดระยะห่างระหว่างโคมไฟ และระยะห่างผนัง (Custom Fixture Spacing)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={autoCenterCustomSpacing}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="คำนวณระยะห่างผนังให้อยู่กึ่งกลางห้องอัตโนมัติ"
              >
                <Sparkles className="w-3 h-3" />
                <span>จัดวางกึ่งกลางห้อง (Auto-Center)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSpacingDrawer(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Spacing along Length (X) */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium text-[11px]">ระยะห่างแนวยาว (Sx):</span>
                <span className="font-mono text-amber-400 font-bold text-xs">{customSpacingX.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max={Math.max(3.5, roomLength).toFixed(1)}
                step="0.05"
                value={customSpacingX}
                onChange={(e) => setCustomSpacingX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-2"
              />
              <div className="flex flex-wrap items-center gap-1">
                {[1.2, 1.5, 1.8, 2.0, 2.4, 3.0].map((preset) => (
                  <button
                    key={`preset-sx-${preset}`}
                    type="button"
                    onClick={() => setCustomSpacingX(preset)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      Math.abs(customSpacingX - preset) < 0.05
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Spacing along Width (Y) */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium text-[11px]">ระยะห่างแนวกว้าง (Sy):</span>
                <span className="font-mono text-amber-400 font-bold text-xs">{customSpacingY.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max={Math.max(3.5, roomWidth).toFixed(1)}
                step="0.05"
                value={customSpacingY}
                onChange={(e) => setCustomSpacingY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-2"
              />
              <div className="flex flex-wrap items-center gap-1">
                {[1.2, 1.5, 1.8, 2.0, 2.4, 3.0].map((preset) => (
                  <button
                    key={`preset-sy-${preset}`}
                    type="button"
                    onClick={() => setCustomSpacingY(preset)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      Math.abs(customSpacingY - preset) < 0.05
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Wall Offset Length (Wx) */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium text-[11px]">ระยะห่างผนังแนวยาว (Wx):</span>
                <span className="font-mono text-sky-400 font-bold text-xs">{customWallSpacingX.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.1"
                max={Math.max(2.0, roomLength / 2).toFixed(1)}
                step="0.05"
                value={customWallSpacingX}
                onChange={(e) => setCustomWallSpacingX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-2"
              />
              <div className="text-[10px] text-slate-400">
                ระยะจากขอบผนังซ้ายถึงโคมแถวแรก
              </div>
            </div>

            {/* 4. Wall Offset Width (Wy) */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-medium text-[11px]">ระยะห่างผนังแนวกว้าง (Wy):</span>
                <span className="font-mono text-sky-400 font-bold text-xs">{customWallSpacingY.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.1"
                max={Math.max(2.0, roomWidth / 2).toFixed(1)}
                step="0.05"
                value={customWallSpacingY}
                onChange={(e) => setCustomWallSpacingY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 mb-2"
              />
              <div className="text-[10px] text-slate-400">
                ระยะจากขอบผนังบนถึงโคมแถวแรก
              </div>
            </div>

          </div>

          {/* Validation Warning if fixtures exceed room boundary */}
          {allFixtures.some(f => f.isOutOfBounds) && (
            <div className="mt-2.5 p-2 bg-amber-950/80 border border-amber-600/60 rounded-xl flex items-center gap-2 text-amber-200 text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                คำเตือน: มีโคมไฟบางจุดอยู่นอกขอบเขตห้อง {roomLength}m × {roomWidth}m (สามารถกดปุ่ม "จัดวางกึ่งกลางห้อง" หรือปรับลดระยะห่างได้)
              </span>
            </div>
          )}
        </div>
      )}

      {/* 💡 Individual Fixtures Matrix & Deletion Drawer (Expandable) */}
      {showFixtureDrawer && (
        <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 text-xs animate-in slide-in-from-top duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
              <Grid className="w-4 h-4 text-amber-400" />
              <span>ผังรายการโคมไฟทั้งหมด ({totalGridFixtures} จุด) - คลิกที่ปุ่มเพื่อลบหรือกู้คืนโคมเฉพาะจุด</span>
            </div>

            <div className="flex items-center gap-2">
              {deletedCount > 0 && (
                <button
                  type="button"
                  onClick={restoreAllFixtures}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>กู้คืนโคมไฟทั้งหมด ({totalGridFixtures} จุด)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFixtureDrawer(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {allFixtures.map((f) => {
              const isDel = f.isDeleted;
              const isOOB = f.isOutOfBounds;
              return (
                <button
                  key={`matrix-f-${f.id}`}
                  type="button"
                  onClick={() => toggleFixtureDeleted(f.id)}
                  className={`p-2 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isDel
                      ? 'bg-rose-950/40 border-rose-900/60 text-rose-300 hover:border-rose-600'
                      : isOOB
                      ? 'bg-amber-950/40 border-amber-900/60 text-amber-300 hover:border-amber-600'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/60'
                  }`}
                  title={isDel ? `คลิกเพื่อกู้คืนโคม #${f.index}` : `คลิกเพื่อลบโคม #${f.index} ออกจากแบบ`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-xs">#{f.index}</span>
                    {isDel ? (
                      <span className="text-[10px] text-rose-400 font-bold">✕ ลบ</span>
                    ) : isOOB ? (
                      <span className="text-[10px] text-amber-400 font-bold">⚠️ นอกห้อง</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">🟢 เปิด</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ({f.x}m, {f.y}m)
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>เคล็ดลับ: ท่านสามารถคลิกที่ตัวโคมไฟบนภาพ 2D หรือ 3D เพื่อดูรายละเอียดและเลือกลบโคมได้เช่นเดียวกัน</span>
          </div>
        </div>
      )}

      {/* Main Interactive Stage Area */}
      <div 
        className={`relative w-full select-none overflow-hidden transition-all duration-150 ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-96'}`}
        style={{
          backgroundColor: dimmingPercent === 0 ? '#05070d' : `rgb(${10 + dimFactor * 12}, ${13 + dimFactor * 14}, ${24 + dimFactor * 18})`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >

        {/* 🎛️ Floating In-Canvas Brightness Slider (Visible during 2D, 3D & Fullscreen Zooming) */}
        {renderInCanvasDimmingSlider()}

        {/* 💡 Floating Inspector Modal for Clicked Fixture */}
        {(() => {
          const inspectedFixture = allFixtures.find(f => f.id === inspectedFixtureId);
          if (!inspectedFixture) return null;

          return (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/95 backdrop-blur border border-amber-500/50 shadow-2xl rounded-2xl p-3.5 max-w-xs text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>โคมไฟ #{inspectedFixture.index}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedFixtureId(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-[11px] mb-3">
                <div className="flex justify-between items-center bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">สถานะ:</span>
                  {inspectedFixture.isDeleted ? (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> ลบออกจากแบบ
                    </span>
                  ) : inspectedFixture.isOutOfBounds ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> อยู่นอกห้อง
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> เปิดใช้งานปกติ
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-slate-400">พิกัดในห้อง (X, Y):</span>
                  <span className="font-mono text-slate-200 font-bold">
                    ({inspectedFixture.x.toFixed(2)}m, {inspectedFixture.y.toFixed(2)}m)
                  </span>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-slate-400">ระดับความสูง (Z):</span>
                  <span className="font-mono text-slate-200 font-bold">{roomHeight.toFixed(2)}m (เพดาน)</span>
                </div>

                {!inspectedFixture.isDeleted && !inspectedFixture.isOutOfBounds && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">ความสว่างใต้โคม (Nadir):</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {calculatePointLux(inspectedFixture.x, inspectedFixture.y, workplaneHeight)} Lux
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Delete / Restore */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleFixtureDeleted(inspectedFixture.id);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                    inspectedFixture.isDeleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                  }`}
                >
                  {inspectedFixture.isDeleted ? (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>นำโคมนี้กลับมาใช้งาน</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบโคมนี้ออกจากแบบ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

        {/* 1. 3D ISOMETRIC / PERSPECTIVE ROOM SIMULATION WITH REAL-TIME LUX POINTS */}
        {viewMode === '3d' && (
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            
            <svg 
              viewBox="0 0 750 440" 
              className="w-full h-full"
            >
              <defs>
                <radialGradient id="lightConeGrad" cx="50%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.85 * dimFactor} />
                  <stop offset="35%" stopColor="#fbbf24" stopOpacity={0.35 * dimFactor} />
                  <stop offset="80%" stopColor="#fef08a" stopOpacity={0.12 * dimFactor} />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
                </radialGradient>

                <radialGradient id="floorLuxGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.55 * dimFactor} />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.20 * dimFactor} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                </radialGradient>

                <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* 3D Floor Surface Polygon */}
              {(() => {
                const p00 = project3D(0, 0, 0, 750, 440);
                const pL0 = project3D(roomLength, 0, 0, 750, 440);
                const pLW = project3D(roomLength, roomWidth, 0, 750, 440);
                const p0W = project3D(0, roomWidth, 0, 750, 440);

                const floorPoints = `${p00.px},${p00.py} ${pL0.px},${pL0.py} ${pLW.px},${pLW.py} ${p0W.px},${p0W.py}`;

                return (
                  <g id="3d-floor-group">
                    <polygon
                      points={floorPoints}
                      fill={dimmingPercent === 0 ? '#0b0f19' : '#0f172a'}
                      stroke="#334155"
                      strokeWidth="2"
                    />

                    {Array.from({ length: Math.ceil(roomLength) + 1 }).map((_, i) => {
                      const x = Math.min(roomLength, i);
                      const sp = project3D(x, 0, 0, 750, 440);
                      const ep = project3D(x, roomWidth, 0, 750, 440);
                      return (
                        <line
                          key={`fg-x-${i}`}
                          x1={sp.px}
                          y1={sp.py}
                          x2={ep.px}
                          y2={ep.py}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      );
                    })}

                    {Array.from({ length: Math.ceil(roomWidth) + 1 }).map((_, j) => {
                      const y = Math.min(roomWidth, j);
                      const sp = project3D(0, y, 0, 750, 440);
                      const ep = project3D(roomLength, y, 0, 750, 440);
                      return (
                        <line
                          key={`fg-y-${j}`}
                          x1={sp.px}
                          y1={sp.py}
                          x2={ep.px}
                          y2={ep.py}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      );
                    })}

                    {dimmingPercent > 0 && fixtures3D.map((f, idx) => {
                      const fp = project3D(f.x, f.y, 0, 750, 440);
                      const radiusPx = (spacingLength * fp.scale * (0.5 + 0.3 * dimFactor));
                      return (
                        <ellipse
                          key={`lux-pool-${idx}`}
                          cx={fp.px}
                          cy={fp.py}
                          rx={radiusPx}
                          ry={radiusPx * Math.sin((tiltAngle * Math.PI) / 180)}
                          fill="url(#floorLuxGlow)"
                        />
                      );
                    })}
                  </g>
                );
              })()}

              {/* 3D Walls */}
              {(() => {
                const p00_0 = project3D(0, 0, 0, 750, 440);
                const pL0_0 = project3D(roomLength, 0, 0, 750, 440);
                const p0W_0 = project3D(0, roomWidth, 0, 750, 440);

                const p00_H = project3D(0, 0, roomHeight, 750, 440);
                const pL0_H = project3D(roomLength, 0, roomHeight, 750, 440);
                const p0W_H = project3D(0, roomWidth, roomHeight, 750, 440);

                return (
                  <g id="3d-walls-group" className="opacity-85">
                    <polygon
                      points={`${p00_0.px},${p00_0.py} ${pL0_0.px},${pL0_0.py} ${pL0_H.px},${pL0_H.py} ${p00_H.px},${p00_H.py}`}
                      fill={dimmingPercent === 0 ? 'rgba(10, 15, 26, 0.85)' : 'rgba(15, 23, 42, 0.75)'}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    <polygon
                      points={`${p00_0.px},${p00_0.py} ${p0W_0.px},${p0W_0.py} ${p0W_H.px},${p0W_H.py} ${p00_H.px},${p00_H.py}`}
                      fill={dimmingPercent === 0 ? 'rgba(15, 23, 42, 0.75)' : 'rgba(30, 41, 59, 0.65)'}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    <line
                      x1={p00_0.px}
                      y1={p00_0.py}
                      x2={p00_H.px}
                      y2={p00_H.py}
                      stroke="#475569"
                      strokeWidth="2.5"
                    />

                    <text
                      x={p00_H.px - 10}
                      y={(p00_0.py + p00_H.py) / 2}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      H = {roomHeight}m
                    </text>
                  </g>
                );
              })()}

              {/* 3D Simulated Furniture Blocks */}
              {showFurniture && (
                <g id="3d-furniture-group">
                  {furnitureItems.map((item) => {
                    const p000 = project3D(item.x, item.y, item.z, 750, 440);
                    const p100 = project3D(item.x + item.w, item.y, item.z, 750, 440);
                    const p110 = project3D(item.x + item.w, item.y + item.d, item.z, 750, 440);
                    const p010 = project3D(item.x, item.y + item.d, item.z, 750, 440);

                    const p001 = project3D(item.x, item.y, item.z + item.h, 750, 440);
                    const p101 = project3D(item.x + item.w, item.y, item.z + item.h, 750, 440);
                    const p111 = project3D(item.x + item.w, item.y + item.d, item.z + item.h, 750, 440);
                    const p011 = project3D(item.x, item.y + item.d, item.z + item.h, 750, 440);

                    const topPoints = `${p001.px},${p001.py} ${p101.px},${p101.py} ${p111.px},${p111.py} ${p011.px},${p011.py}`;
                    const frontPoints = `${p010.px},${p010.py} ${p110.px},${p110.py} ${p111.px},${p111.py} ${p011.px},${p011.py}`;
                    const rightPoints = `${p100.px},${p100.py} ${p110.px},${p110.py} ${p111.px},${p111.py} ${p101.px},${p101.py}`;

                    const centerTop = {
                      x: (p001.px + p101.px + p111.px + p011.px) / 4,
                      y: (p001.py + p101.py + p111.py + p011.py) / 4
                    };

                    return (
                      <g key={item.id} className="cursor-pointer group" filter="url(#shadow3d)">
                        <polygon
                          points={`${p000.px},${p000.py} ${p100.px},${p100.py} ${p110.px},${p110.py} ${p010.px},${p010.py}`}
                          fill="rgba(0,0,0,0.5)"
                        />

                        <polygon
                          points={frontPoints}
                          fill={item.color}
                          stroke="#1e293b"
                          strokeWidth="1"
                          opacity="0.9"
                        />

                        <polygon
                          points={rightPoints}
                          fill={item.color}
                          stroke="#0f172a"
                          strokeWidth="1"
                          opacity="0.75"
                        />

                        <polygon
                          points={topPoints}
                          fill={item.color}
                          stroke="#64748b"
                          strokeWidth="1"
                          opacity="1.0"
                        />

                        <text
                          x={centerTop.x}
                          y={centerTop.y + 4}
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          {item.icon}
                        </text>

                        <title>{`${item.name} (${item.label}) - กว้าง ${item.w}m × ยาว ${item.d}m × สูง ${item.h}m`}</title>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3D Volumetric Light Cones */}
              {showLightCones && dimmingPercent > 0 && (
                <g id="3d-light-cones-group" className="pointer-events-none">
                  {fixtures3D.map((f, idx) => {
                    const topP = project3D(f.x, f.y, f.z, 750, 440);
                    const botP = project3D(f.x, f.y, 0, 750, 440);
                    
                    const spreadRadiusM = Math.tan(((numericBeamAngle / 2) * Math.PI) / 180) * roomHeight;
                    const spreadPx = spreadRadiusM * topP.scale;

                    const radTilt = (tiltAngle * Math.PI) / 180;
                    const spreadY = spreadPx * Math.sin(radTilt);

                    return (
                      <g key={`cone-${idx}`} opacity={0.85 * dimFactor}>
                        <polygon
                          points={`
                            ${topP.px},${topP.py} 
                            ${botP.px - spreadPx},${botP.py} 
                            ${botP.px + spreadPx},${botP.py}
                          `}
                          fill="url(#lightConeGrad)"
                        />

                        <ellipse
                          cx={botP.px}
                          cy={botP.py}
                          rx={spreadPx}
                          ry={spreadY}
                          fill={`rgba(245, 158, 11, ${0.15 * dimFactor})`}
                          stroke={`rgba(251, 191, 36, ${0.35 * dimFactor})`}
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 🌟 3D POINT-BY-POINT REAL-TIME LUX VALUE TAGS (SURROUNDING & INTER-FIXTURE) */}
              {showPointLux && (
                <g id="3d-lux-point-badges" className="select-none font-mono">
                  {sampleLuxPoints.map((pt) => {
                    const p = project3D(pt.x, pt.y, pt.z, 750, 440);
                    const isUnder = pt.type === 'under_fixture';
                    const isInter = pt.type === 'mid_row_x' || pt.type === 'mid_col_y';
                    const isQuad = pt.type === 'quad_center';
                    const isPerim = pt.type === 'perimeter';

                    const dotColor =
                      dimmingPercent === 0
                        ? '#475569'
                        : isUnder
                        ? '#f59e0b'
                        : isInter
                        ? '#38bdf8'
                        : isQuad
                        ? '#10b981'
                        : isPerim
                        ? '#a855f7'
                        : '#94a3b8';

                    const badgeW = pt.lux >= 1000 ? 46 : 42;
                    const badgeH = 14;

                    const statusBorder =
                      dimmingPercent === 0
                        ? '#334155'
                        : pt.lux >= targetLux * 0.9
                        ? '#10b981'
                        : pt.lux >= targetLux * 0.5
                        ? '#f59e0b'
                        : '#f43f5e';

                    const statusText =
                      dimmingPercent === 0
                        ? '#94a3b8'
                        : pt.lux >= targetLux * 0.9
                        ? '#34d399'
                        : pt.lux >= targetLux * 0.5
                        ? '#fbbf24'
                        : '#fb7185';

                    return (
                      <g key={`lux-badge-3d-${pt.id}`} className="cursor-pointer group">
                        {/* Base anchor dot on workplane surface */}
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r={isUnder ? '3.5' : isInter || isQuad ? '2.5' : '2'}
                          fill={dotColor}
                          stroke="#ffffff"
                          strokeWidth="0.8"
                        />

                        {/* Lux Tag Pill */}
                        <g transform={`translate(${p.px - badgeW / 2}, ${p.py - 18})`}>
                          <rect
                            x="0"
                            y="0"
                            width={badgeW}
                            height={badgeH}
                            rx="3.5"
                            fill="#090d16"
                            stroke={statusBorder}
                            strokeWidth={isUnder || isInter ? '1.2' : '0.9'}
                            className="drop-shadow-md"
                          />
                          <text
                            x={badgeW / 2}
                            y="10.5"
                            fill={statusText}
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.icon} {pt.lux} lx
                          </text>
                        </g>

                        <title>{`${pt.label} (${pt.subLabel}) | ค่าความสว่าง: ${pt.lux} Lux (เป้าหมาย ${targetLux} Lux - ${((pt.lux / Math.max(1, targetLux)) * 100).toFixed(0)}%) | พิกัด (${pt.x.toFixed(2)}m, ${pt.y.toFixed(2)}m, Z=${pt.z.toFixed(2)}m)`}</title>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3D Ceiling Fixtures (Luminaires) */}
              <g id="3d-fixtures-group">
                {fixtures3D.map((f, idx) => {
                  const p = project3D(f.x, f.y, f.z, 750, 440);
                  const isSelected = selectedFixtureIdx === idx;

                  return (
                    <g 
                      key={`fixture-node-${idx}`} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFixtureIdx(isSelected ? null : idx);
                      }}
                    >
                      {dimmingPercent > 0 && (
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r={14 * (0.6 + 0.4 * dimFactor)}
                          fill={`rgba(245, 158, 11, ${0.3 * dimFactor})`}
                          className="animate-pulse"
                        />
                      )}

                      <circle
                        cx={p.px}
                        cy={p.py}
                        r={isSelected ? "9" : "7.5"}
                        fill={
                          dimmingPercent === 0 
                            ? '#334155' 
                            : isSelected 
                            ? '#fbbf24' 
                            : '#f59e0b'
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />

                      <circle
                        cx={p.px}
                        cy={p.py}
                        r="3"
                        fill={dimmingPercent === 0 ? '#64748b' : '#ffffff'}
                      />

                      <text
                        x={p.px}
                        y={p.py - 11}
                        fill="#fef08a"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="drop-shadow"
                      >
                        #{idx + 1}
                      </text>

                      <title>{`${f.label} | กำลังวัตต์จริง: ${(fixtureWatts * dimFactor).toFixed(1)}W | ลูเมน: ${Math.round(fixtureLumens * dimFactor)} lm | หรี่: ${dimmingPercent}%`}</title>
                    </g>
                  );
                })}
              </g>

              {/* 3D Dimension Callouts Overlay */}
              {showDimensions && (
                <g id="3d-dimension-callouts" className="pointer-events-none font-mono text-[9px]">
                  {fixtureRows > 1 && (() => {
                    const p1 = project3D(spacingLength * 0.5, spacingWidth * 0.5, roomHeight, 750, 440);
                    const p2 = project3D(spacingLength * 1.5, spacingWidth * 0.5, roomHeight, 750, 440);
                    return (
                      <g>
                        <line
                          x1={p1.px}
                          y1={p1.py}
                          x2={p2.px}
                          y2={p2.py}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3,3"
                        />
                        <rect
                          x={(p1.px + p2.px) / 2 - 28}
                          y={(p1.py + p2.py) / 2 - 7}
                          width="56"
                          height="14"
                          fill="#0f172a"
                          rx="3"
                          stroke="#0284c7"
                          strokeWidth="0.8"
                        />
                        <text
                          x={(p1.px + p2.px) / 2}
                          y={(p1.py + p2.py) / 2 + 3}
                          fill="#38bdf8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          S_L = {spacingLength.toFixed(2)}m
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

            </svg>

            {/* Orbit & Drag Hint */}
            <div className="absolute bottom-2.5 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>คลิกและลากเมาส์เพื่อหมุนห้อง 3D ({Math.round(rotationAngle)}°, {Math.round(tiltAngle)}°) | ซูม {Math.round(zoomLevel3D * 100)}%</span>
            </div>

            {/* Quick 3D Rotation Orbit Buttons */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={() => setRotationAngle((prev) => (prev - 15) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                title="หมุนซ้าย 15°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotationAngle((prev) => (prev + 15) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                title="หมุนขวา 15°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTiltAngle((prev) => Math.min(75, prev + 8))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                title="มองจากมุมสูงขึ้น (Top Down)"
              >
                <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => setTiltAngle((prev) => Math.max(10, prev - 8))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                title="มองจากระดับสายตา (Eye-level)"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>

          </div>
        )}

        {/* 2. 2D ARCHITECTURAL BLUEPRINT WITH SCALABLE ZOOM & IN-CANVAS SLIDER */}
        {viewMode === '2d' && (
          <div className="w-full h-full relative p-4 flex items-center justify-center">
            
            {(() => {
              const padX = 65;
              const padY = 55;
              const baseScale = Math.min(
                (650 - padX * 2) / Math.max(1, roomLength),
                (380 - padY * 2) / Math.max(1, roomWidth)
              );
              const scale = baseScale * zoomLevel2D;

              const svgW = roomLength * scale + padX * 2;
              const svgH = roomWidth * scale + padY * 2;

              const originX = padX;
              const originY = padY;

              return (
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full h-full max-h-full drop-shadow-xl"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * svgW;
                    const mouseSvgY = ((e.clientY - rect.top) / rect.height) * svgH;

                    const roomX = (mouseSvgX - originX) / scale;
                    const roomY = (mouseSvgY - originY) / scale;

                    if (roomX >= 0 && roomX <= roomLength && roomY >= 0 && roomY <= roomWidth) {
                      setHoverProbePos({
                        x: roomX,
                        y: roomY,
                        lux: calculatePointLux(roomX, roomY, workplaneHeight)
                      });
                    } else {
                      setHoverProbePos(null);
                    }
                  }}
                  onMouseLeave={() => setHoverProbePos(null)}
                >
                  <defs>
                    <pattern id="cadGrid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                      <rect width={scale} height={scale} fill="none" stroke="#1e293b" strokeWidth="0.6" />
                    </pattern>
                  </defs>

                  <rect
                    x={originX}
                    y={originY}
                    width={roomLength * scale}
                    height={roomWidth * scale}
                    fill={dimmingPercent === 0 ? '#070a12' : '#090d16'}
                    stroke="#475569"
                    strokeWidth="2.5"
                    rx="4"
                  />

                  <rect
                    x={originX}
                    y={originY}
                    width={roomLength * scale}
                    height={roomWidth * scale}
                    fill="url(#cadGrid)"
                  />

                  {showFurniture && (
                    <g id="2d-furniture-layout" className="opacity-90">
                      {furnitureItems.map((item) => {
                        const fx = originX + item.x * scale;
                        const fy = originY + item.y * scale;
                        const fw = item.w * scale;
                        const fh = item.d * scale;

                        return (
                          <g key={`2d-furn-${item.id}`}>
                            <rect
                              x={fx}
                              y={fy}
                              width={fw}
                              height={fh}
                              fill={item.color}
                              stroke="#64748b"
                              strokeWidth="1.2"
                              rx="3"
                              opacity="0.85"
                            />
                            <rect
                              x={fx + 2}
                              y={fy + 2}
                              width={Math.max(2, fw - 4)}
                              height={Math.max(2, fh - 4)}
                              fill="none"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="0.8"
                            />
                            <text
                              x={fx + fw / 2}
                              y={fy + fh / 2 + 3}
                              fill="#ffffff"
                              fontSize={Math.min(9, fw * 0.22)}
                              fontWeight="bold"
                              textAnchor="middle"
                              className="select-none font-sans drop-shadow"
                            >
                              {item.icon} {item.name.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* 🌐 Inter-fixture Photometric Guide Network (Dashed Lines between Fixtures) */}
                  {showInterFixtureLines && showPointLux && (
                    <g id="2d-inter-fixture-grid-lines" opacity="0.6">
                      {/* Horizontal connecting lines along rows */}
                      {Array.from({ length: fixtureRows }).map((_, r) => {
                        const y = originY + (r + 0.5) * (spacingWidth * scale);
                        const startX = originX + 0.5 * (spacingLength * scale);
                        const endX = originX + (fixtureRows - 0.5) * (spacingLength * scale);
                        return (
                          <line
                            key={`grid-line-h-${r}`}
                            x1={startX}
                            y1={y}
                            x2={endX}
                            y2={y}
                            stroke="#38bdf8"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                          />
                        );
                      })}

                      {/* Vertical connecting lines along columns */}
                      {Array.from({ length: fixtureCols }).map((_, c) => {
                        const x = originX + (c + 0.5) * (spacingLength * scale);
                        const startY = originY + 0.5 * (spacingWidth * scale);
                        const endY = originY + (fixtureCols - 0.5) * (spacingWidth * scale);
                        return (
                          <line
                            key={`grid-line-v-${c}`}
                            x1={x}
                            y1={startY}
                            x2={x}
                            y2={endY}
                            stroke="#38bdf8"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* Ceiling Fixture Circles with Optical Cones */}
                  {Array.from({ length: fixtureRows }).flatMap((_, r) =>
                    Array.from({ length: fixtureCols }).map((_, c) => {
                      const cx = originX + (r + 0.5) * (spacingLength * scale);
                      const cy = originY + (c + 0.5) * (spacingWidth * scale);
                      const spreadRadiusM = Math.tan(((numericBeamAngle / 2) * Math.PI) / 180) * Math.max(0.5, roomHeight - workplaneHeight);
                      const radiusPx = Math.max(10, spreadRadiusM * scale);

                      return (
                        <g key={`2d-fixture-${r}-${c}`}>
                          {dimmingPercent > 0 && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={radiusPx}
                              fill={`rgba(245, 158, 11, ${0.14 * dimFactor})`}
                              stroke={`rgba(251, 191, 36, ${0.3 * dimFactor})`}
                              strokeWidth="0.8"
                              strokeDasharray="2,2"
                            />
                          )}

                          <circle
                            cx={cx}
                            cy={cy}
                            r="6"
                            fill={dimmingPercent === 0 ? '#334155' : '#f59e0b'}
                            stroke="#ffffff"
                            strokeWidth="1.8"
                          />
                          
                          <circle
                            cx={cx}
                            cy={cy}
                            r="2"
                            fill="#0f172a"
                          />

                          <text
                            x={cx}
                            y={cy - 9}
                            fill="#fef08a"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            #{r * fixtureCols + c + 1}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* 🌟 2D REAL-TIME LUX VALUE TAGS (SURROUNDING & INTER-FIXTURE) */}
                  {showPointLux && (
                    <g id="2d-point-lux-values" className="select-none font-mono">
                      {sampleLuxPoints.map((pt) => {
                        const px = originX + pt.x * scale;
                        const py = originY + pt.y * scale;

                        const isUnder = pt.type === 'under_fixture';
                        const isInter = pt.type === 'mid_row_x' || pt.type === 'mid_col_y';
                        const isQuad = pt.type === 'quad_center';
                        const isPerim = pt.type === 'perimeter';

                        const badgeW = pt.lux >= 1000 ? 44 : 38;
                        const badgeH = 13;

                        const statusBorder =
                          dimmingPercent === 0
                            ? '#334155'
                            : isUnder
                            ? '#f59e0b'
                            : isInter
                            ? '#38bdf8'
                            : isQuad
                            ? '#10b981'
                            : isPerim
                            ? '#a855f7'
                            : pt.lux >= targetLux * 0.9
                            ? '#10b981'
                            : '#fb7185';

                        const statusBg =
                          dimmingPercent === 0
                            ? '#0b0f19'
                            : isUnder
                            ? '#1c1305'
                            : isInter
                            ? '#041626'
                            : isQuad
                            ? '#031a12'
                            : '#090d16';

                        const statusText =
                          dimmingPercent === 0
                            ? '#94a3b8'
                            : isUnder
                            ? '#fde047'
                            : isInter
                            ? '#7dd3fc'
                            : isQuad
                            ? '#6ee7b7'
                            : isPerim
                            ? '#d8b4fe'
                            : pt.lux >= targetLux * 0.9
                            ? '#34d399'
                            : '#fda4af';

                        // Position offset based on point type to prevent visual collision
                        let offsetY = -badgeH / 2;
                        let offsetX = -badgeW / 2;
                        if (isUnder) {
                          offsetY = 9; // Below luminaire icon
                        }

                        return (
                          <g key={`2d-lux-pt-${pt.id}`} className="cursor-pointer group">
                            {/* Anchor point marker */}
                            <circle
                              cx={px}
                              cy={py}
                              r={isUnder ? '2.5' : isInter || isQuad ? '2' : '1.5'}
                              fill={isUnder ? '#f59e0b' : isInter ? '#38bdf8' : isQuad ? '#10b981' : '#94a3b8'}
                            />

                            <g transform={`translate(${px + offsetX}, ${py + offsetY})`}>
                              <rect
                                x="0"
                                y="0"
                                width={badgeW}
                                height={badgeH}
                                rx="3"
                                fill={statusBg}
                                stroke={statusBorder}
                                strokeWidth={isUnder || isInter ? '1.1' : '0.8'}
                                className="drop-shadow"
                              />
                              <text
                                x={badgeW / 2}
                                y="9.5"
                                fill={statusText}
                                fontSize="7"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {pt.icon} {pt.lux}
                              </text>
                            </g>

                            <title>{`${pt.label} (${pt.subLabel}) | ความสว่าง: ${pt.lux} Lux | พิกัด (${pt.x.toFixed(2)}m, ${pt.y.toFixed(2)}m)`}</title>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {hoverProbePos && (
                    <g id="2d-hover-probe" className="pointer-events-none font-mono">
                      <line
                        x1={originX + hoverProbePos.x * scale}
                        y1={originY}
                        x2={originX + hoverProbePos.x * scale}
                        y2={originY + roomWidth * scale}
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <line
                        x1={originX}
                        y1={originY + hoverProbePos.y * scale}
                        x2={originX + roomLength * scale}
                        y2={originY + hoverProbePos.y * scale}
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <circle
                        cx={originX + hoverProbePos.x * scale}
                        cy={originY + hoverProbePos.y * scale}
                        r="4"
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {showDimensions && (
                    <g id="2d-dimension-annotations">
                      {renderDimensionLine(
                        originX,
                        originY - 30,
                        originX + roomLength * scale,
                        originY - 30,
                        `L = ${roomLength}m`
                      )}

                      {renderDimensionLine(
                        originX,
                        originY - 14,
                        originX + wallSpacingLength * scale,
                        originY - 14,
                        `${wallSpacingLength.toFixed(2)}m`
                      )}

                      {Array.from({ length: Math.max(0, fixtureRows - 1) }).map((_, r) => {
                        const sx = originX + (r + 0.5) * (spacingLength * scale);
                        const ex = originX + (r + 1.5) * (spacingLength * scale);
                        return (
                          <g key={`dim-r-${r}`}>
                            {renderDimensionLine(
                              sx,
                              originY - 14,
                              ex,
                              originY - 14,
                              `S_L=${spacingLength.toFixed(2)}m`
                            )}
                          </g>
                        );
                      })}

                      {renderDimensionLine(
                        originX + (roomLength - wallSpacingLength) * scale,
                        originY - 14,
                        originX + roomLength * scale,
                        originY - 14,
                        `${wallSpacingLength.toFixed(2)}m`
                      )}

                      {renderDimensionLine(
                        originX - 42,
                        originY,
                        originX - 42,
                        originY + roomWidth * scale,
                        `W=${roomWidth}m`,
                        0,
                        true
                      )}

                      {renderDimensionLine(
                        originX - 20,
                        originY,
                        originX - 20,
                        originY + wallSpacingWidth * scale,
                        `${wallSpacingWidth.toFixed(2)}m`,
                        0,
                        true
                      )}

                      {Array.from({ length: Math.max(0, fixtureCols - 1) }).map((_, c) => {
                        const sy = originY + (c + 0.5) * (spacingWidth * scale);
                        const ey = originY + (c + 1.5) * (spacingWidth * scale);
                        return (
                          <g key={`dim-c-${c}`}>
                            {renderDimensionLine(
                              originX - 20,
                              sy,
                              originX - 20,
                              ey,
                              `S_W=${spacingWidth.toFixed(2)}m`,
                              0,
                              true
                            )}
                          </g>
                        );
                      })}

                      {renderDimensionLine(
                        originX - 20,
                        originY + (roomWidth - wallSpacingWidth) * scale,
                        originX - 20,
                        originY + roomWidth * scale,
                        `${wallSpacingWidth.toFixed(2)}m`,
                        0,
                        true
                      )}
                    </g>
                  )}

                </svg>
              );
            })()}

            {hoverProbePos && (
              <div className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-xl border border-amber-500/60 shadow-xl text-xs flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400 animate-pulse" />
                <div>
                  <div className="text-[10px] text-slate-400">
                    พิกัด ({hoverProbePos.x.toFixed(2)}m, {hoverProbePos.y.toFixed(2)}m)
                  </div>
                  <div className="font-mono font-bold text-amber-300">
                    {hoverProbePos.lux} Lux
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. ELEVATION CROSS SECTION */}
        {viewMode === 'elevation' && (
          <div className="w-full h-full p-4 flex items-center justify-center">
            <svg viewBox="0 0 620 320" className="w-full h-full max-h-80 drop-shadow-xl">
              
              <rect
                x="80"
                y="40"
                width="460"
                height="220"
                fill={dimmingPercent === 0 ? '#090d16' : '#0f172a'}
                stroke="#475569"
                strokeWidth="2.5"
                rx="4"
              />

              <line x1="80" y1="40" x2="540" y2="40" stroke="#f59e0b" strokeWidth="4" />
              <text x="548" y="44" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ฝ้าเพดาน H={roomHeight}m
              </text>

              <line x1="80" y1="260" x2="540" y2="260" stroke="#64748b" strokeWidth="4" />
              <text x="548" y="264" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ระดับพื้น 0.00m
              </text>

              {(() => {
                const workplaneY = 260 - (workplaneHeight / roomHeight) * 220;
                return (
                  <g>
                    <line
                      x1="80"
                      y1={workplaneY}
                      x2="540"
                      y2={workplaneY}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                    <text x="548" y={workplaneY + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      ระนาบงาน {workplaneHeight}m ({currentEffectiveLux} Lux)
                    </text>
                  </g>
                );
              })()}

              {Array.from({ length: fixtureRows }).map((_, r) => {
                const fx = 80 + (r + 0.5) * (460 / fixtureRows);
                const fy = 40;
                const coneSpreadPx = Math.min(180, Math.tan(((numericBeamAngle / 2) * Math.PI) / 180) * 220);

                return (
                  <g key={`elev-f-${r}`}>
                    {dimmingPercent > 0 && (
                      <polygon
                        points={`${fx},${fy} ${fx - coneSpreadPx},260 ${fx + coneSpreadPx},260`}
                        fill="url(#lightConeGrad)"
                        opacity={0.7 * dimFactor}
                      />
                    )}

                    <rect
                      x={fx - 14}
                      y="36"
                      width="28"
                      height="8"
                      fill={dimmingPercent === 0 ? '#334155' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      rx="2"
                    />
                    <circle cx={fx} cy="44" r="4" fill={dimmingPercent === 0 ? '#64748b' : '#ffffff'} />
                  </g>
                );
              })}

              {renderDimensionLine(50, 40, 50, 260, `H=${roomHeight}m`, 0, true)}

            </svg>
          </div>
        )}

      </div>

      {/* Visualizer Bottom Detail Legend Bar & Lux Photometric Analytics */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
        
        {/* Top row: Point Type Icon Legend & Color Code */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-bold mr-1">สัญลักษณ์จุด Lux:</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-mono font-semibold">
              ⚡ ใต้โคม
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono font-semibold">
              ↔/↕ ระหว่างโคมรอบตัว
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono font-semibold">
              ✛ กึ่งกลาง 4 โคม
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80 font-mono font-semibold">
              ▫ ริมผนังรอบโคม
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-semibold">
              ◤ มุมห้อง
            </span>
          </div>

          {/* Color Meaning Scale */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
              🟢 ผ่านเกณฑ์ (≥90%)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold">
              🟡 ปานกลาง (55-89%)
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
              🔴 ชายขอบ (&lt;55%)
            </span>
          </div>

        </div>

        {/* Bottom row: Photometric Stats Bar (Min, Max, Avg, Uniformity Ratio) */}
        <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">ความสม่ำเสมอแสง (Uniformity U₀):</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                Number(luxStats.uniformity) >= 0.6
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : Number(luxStats.uniformity) >= 0.4
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {luxStats.uniformity} {Number(luxStats.uniformity) >= 0.6 ? '(ดีเยี่ยม)' : Number(luxStats.uniformity) >= 0.4 ? '(มาตรฐาน)' : '(ความต่างสูง)'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">Min:</span>
              <span className="font-bold text-rose-400">{luxStats.min} lx</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">Avg:</span>
              <span className="font-bold text-emerald-400">{luxStats.avg} lx</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">Max (ใต้โคม):</span>
              <span className="font-bold text-amber-400">{luxStats.max} lx</span>
            </div>

            {luxStats.interAvg > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-slate-300">
                <span className="text-slate-500">เฉลี่ยระหว่างโคม:</span>
                <span className="font-bold text-sky-400">{luxStats.interAvg} lx</span>
              </div>
            )}
          </div>

          {/* Current Dimmed Effective Lux */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">ค่าเฉลี่ยห้อง (หรี่ {dimmingPercent}%):</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-black text-xs">
              {currentEffectiveLux} Lux
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
