import { useMemo, useState } from 'react'
import { Card, InputNumber, Button, Tabs, message, Space, Divider, Typography, Table, Upload, Image, Input, ColorPicker, Select } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import { useSettingsStore } from '../stores/settingsStore'

const { Title, Text } = Typography

const DEFAULT_BANNER_GRADIENT = 'linear-gradient(90deg, #0b4fb3 0%, #b54ad5 100%)'
const DEFAULT_HEALTH_GAUGE_COLORS = ['#ef4444', '#f97316', '#fb923c', '#facc15', '#a3e635', '#84cc16', '#22c55e', '#10b981']

function parseLinearGradient(input) {
    const raw = String(input || '').trim() || DEFAULT_BANNER_GRADIENT

    const angleMatch = raw.match(/linear-gradient\(\s*([0-9.]+)\s*deg/i)
    const angle = angleMatch ? Number(angleMatch[1]) : 90

    const hexes = raw.match(/#(?:[0-9a-fA-F]{3,8})\b/g) || []
    let start = hexes[0]
    let end = hexes[1]

    if (!start || !end) {
        const funcs = raw.match(/(?:rgba?|hsla?)\([^\)]+\)/g) || []
        start = start || funcs[0]
        end = end || funcs[1]
    }

    start = start || '#0b4fb3'
    end = end || '#b54ad5'

    return { raw, angle: Number.isFinite(angle) ? angle : 90, start, end }
}

function buildLinearGradient({ angle, start, end }) {
    const a = Number.isFinite(angle) ? angle : 90
    const s = String(start || '#0b4fb3')
    const e = String(end || '#b54ad5')
    return `linear-gradient(${a}deg, ${s} 0%, ${e} 100%)`
}

function SettingsPage() {
    const {
        biochemistrySettings,
        urinalysisSettings,
        cardiovascularSettings,
        liverFibrosisSettings,
        inflammationSettings,
        pdfAssets,
        updateBiochemistrySettings,
        updateUrinalysisSettings,
        updateCardiovascularSettings,
        updateLiverFibrosisSettings,
        updateInflammationSettings,
        updatePdfAssets,
        resetPdfAssets,
        resetToDefaults
    } = useSettingsStore()

    const [saving, setSaving] = useState(false)

    const handleSave = () => {
        setSaving(true)
        // Settings are auto-saved to localStorage by Zustand persist
        setTimeout(() => {
            setSaving(false)
            message.success('Đã lưu cài đặt')
        }, 500)
    }

    const handleReset = () => {
        resetToDefaults()
        message.info('Đã khôi phục cài đặt mặc định')
    }

    const readAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

    const organIconItems = useMemo(() => ([
        { key: 'cardiovascular', label: 'Tim mạch & Mỡ Máu' },
        { key: 'blood', label: 'Huyết Học & Miễn Dịch' },
        { key: 'liver', label: 'Gan & Mật' },
        { key: 'kidney', label: 'Thận & Tiết Niệu' }
    ]), [])

    const deepDiveIconItems = useMemo(() => ([
        { key: 'cardiovascular', label: 'Deep Dive - Tim mạch' },
        { key: 'liver', label: 'Deep Dive - Gan' },
        { key: 'inflammation', label: 'Deep Dive - Viêm' }
    ]), [])

    const evaluationIconItems = useMemo(() => ([
        { key: 'negatives', label: 'Đánh giá - Chưa tốt' },
        { key: 'positives', label: 'Đánh giá - Ưu điểm' },
        { key: 'general', label: 'Đánh giá - Chung' }
    ]), [])

    // Biochemistry settings table
    const biochemColumns = [
        {
            title: 'Chỉ số',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Ngưỡng thấp',
            dataIndex: 'low',
            key: 'low',
            width: 120,
            render: (value, record) => (
                <InputNumber
                    value={value}
                    onChange={(v) => updateBiochemistrySettings(record.key, { low: v })}
                    step={0.1}
                    size="small"
                />
            )
        },
        {
            title: 'Ngưỡng cao',
            dataIndex: 'high',
            key: 'high',
            width: 120,
            render: (value, record) => (
                <InputNumber
                    value={value}
                    onChange={(v) => updateBiochemistrySettings(record.key, { high: v })}
                    step={0.1}
                    size="small"
                />
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 140,
            render: (text, record) => {
                const opts = (record.unitOptions || []).map((u) => ({ label: u, value: u }))
                return (
                    <Select
                        value={text}
                        onChange={(v) => updateBiochemistrySettings(record.key, { unit: v })}
                        size="small"
                        style={{ width: '100%' }}
                        showSearch
                        mode="combobox"
                        options={opts}
                    />
                )
            }
        },
        {
            title: 'Chỉ số tham chiếu',
            dataIndex: 'referenceText',
            key: 'referenceText',
            width: 150,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateBiochemistrySettings(record.key, { referenceText: e.target.value })}
                    size="small"
                    placeholder="VD: 4,07-5,5"
                />
            )
        },
        {
            title: 'Danh sách đơn vị',
            dataIndex: 'unitOptions',
            key: 'unitOptions',
            width: 220,
            render: (value, record) => (
                <Input
                    value={(value || []).join(', ')}
                    onChange={(e) => {
                        const raw = e.target.value
                        const arr = raw
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        updateBiochemistrySettings(record.key, { unitOptions: arr })
                    }}
                    size="small"
                    placeholder="VD: mmol/L, mg/dL"
                />
            )
        },
        {
            title: 'Logic',
            key: 'logic',
            render: (_, record) => (
                <Text type="secondary" className="text-xs">
                    {`< ${record.low} = Thấp, ${record.low}-${record.high} = BT, > ${record.high} = Cao`}
                </Text>
            )
        }
    ]

    const biochemData = Object.entries(biochemistrySettings).map(([key, value]) => ({
        key,
        name: key,
        ...value
    }))

    // Urinalysis settings table
    const urinalysisColumns = [
        {
            title: 'Danh mục',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Chỉ số tham chiếu',
            dataIndex: 'referenceText',
            key: 'referenceText',
            width: 160,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => updateUrinalysisSettings(record.key, { referenceText: e.target.value })}
                    size="small"
                    placeholder="VD: 1,005-1,030"
                />
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 160,
            render: (text, record) => {
                const opts = (record.unitOptions || []).map((u) => ({ label: u, value: u }))
                return (
                    <Select
                        value={text}
                        onChange={(v) => updateUrinalysisSettings(record.key, { unit: v })}
                        size="small"
                        style={{ width: '100%' }}
                        showSearch
                        mode="combobox"
                        options={opts}
                        placeholder="(trống)"
                    />
                )
            }
        },
        {
            title: 'Danh sách đơn vị',
            dataIndex: 'unitOptions',
            key: 'unitOptions',
            width: 240,
            render: (value, record) => (
                <Input
                    value={(value || []).join(', ')}
                    onChange={(e) => {
                        const raw = e.target.value
                        const arr = raw
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        updateUrinalysisSettings(record.key, { unitOptions: arr })
                    }}
                    size="small"
                    placeholder="VD: mmol/L, mg/dL"
                />
            )
        }
    ]

    const urinalysisData = Object.entries(urinalysisSettings || {}).map(([key, value]) => ({
        key,
        name: key,
        ...value
    }))

    // 5-level settings component
    const FiveLevelSettings = ({ title, settings, onUpdate }) => {
        const items = Object.entries(settings).map(([key, value]) => ({
            key,
            label: key.replace(/([A-Z])/g, ' $1').trim(),
            ...value
        }))

        const levelColors = (pdfAssets?.fiveLevelBar?.colors && pdfAssets.fiveLevelBar.colors.length === 5)
            ? pdfAssets.fiveLevelBar.colors
            : ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

        return (
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.key} className="border rounded-lg p-4">
                        <Text strong className="block mb-3">{item.label}</Text>
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div key={level} className="text-center">
                                    <div
                                        className="h-6 rounded mb-2"
                                        style={{
                                            backgroundColor: levelColors[level - 1]
                                        }}
                                    />
                                    <Text type="secondary" className="text-xs block mb-1">
                                        Mức {level}
                                    </Text>
                                    <InputNumber
                                        value={item.thresholds?.[level - 1] || 0}
                                        onChange={(v) => {
                                            const newThresholds = [...(item.thresholds || [0, 0, 0, 0, 0])]
                                            newThresholds[level - 1] = v
                                            onUpdate(item.key, { thresholds: newThresholds })
                                        }}
                                        size="small"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            ))}
                        </div>
                        <Text type="secondary" className="text-xs mt-2 block">
                            Giá trị &lt; Ngưỡng[1] → Mức 1, ..., Giá trị ≥ Ngưỡng[4] → Mức 5
                        </Text>
                    </div>
                ))}
            </div>
        )
    }

    const tabItems = [
        {
            key: '1',
            label: '🧪 Sinh hóa máu',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Cài đặt ngưỡng để tự động xác định "Thấp", "Bình thường", "Cao" cho các chỉ số sinh hóa.
                    </Text>
                    <Table
                        dataSource={biochemData}
                        columns={biochemColumns}
                        pagination={false}
                        size="small"
                        bordered
                    />
                </Card>
            )
        },
        {
            key: '2',
            label: '🧫 Nước tiểu',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Cài đặt chỉ số tham chiếu và đơn vị cho bảng phân tích nước tiểu (mặc định theo mẫu).
                    </Text>
                    <Table
                        dataSource={urinalysisData}
                        columns={urinalysisColumns}
                        pagination={false}
                        size="small"
                        bordered
                    />
                </Card>
            )
        },
        {
            key: '3',
            label: '💔 Tim mạch',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Cài đặt ngưỡng cho thanh 5 mức của các chỉ số tim mạch.
                    </Text>
                    <FiveLevelSettings
                        title="Tiên lượng đột quỵ & tim mạch"
                        settings={cardiovascularSettings}
                        onUpdate={updateCardiovascularSettings}
                    />
                </Card>
            )
        },
        {
            key: '4',
            label: '🫁 Gan mật',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Cài đặt ngưỡng cho thanh 5 mức của các chỉ số gan.
                    </Text>
                    <FiveLevelSettings
                        title="Tầm soát xơ hóa gan"
                        settings={liverFibrosisSettings}
                        onUpdate={updateLiverFibrosisSettings}
                    />
                </Card>
            )
        },
        {
            key: '5',
            label: '🔥 Viêm & miễn dịch',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Cài đặt ngưỡng cho thanh 5 mức của các chỉ số viêm và miễn dịch.
                    </Text>
                    <FiveLevelSettings
                        title="Sức đề kháng & viêm"
                        settings={inflammationSettings}
                        onUpdate={updateInflammationSettings}
                    />
                </Card>
            )
        },
        {
            key: '6',
            label: '🖼️ PDF assets',
            children: (
                <Card>
                    <Text type="secondary" className="block mb-4">
                        Upload ảnh (PNG/SVG/JPG) để dùng trong PDF. Tất cả được lưu trong trình duyệt (localStorage).
                    </Text>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card size="small" title="Logo (tuỳ chọn)">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={async (file) => {
                                        try {
                                            const dataUrl = await readAsDataUrl(file)
                                            updatePdfAssets({ logoUrl: dataUrl })
                                            message.success('Đã cập nhật logo')
                                        } catch {
                                            message.error('Không đọc được file ảnh')
                                        }
                                        return false
                                    }}
                                >
                                    <Button>Chọn ảnh logo</Button>
                                </Upload>
                                {pdfAssets?.logoUrl ? (
                                    <div className="flex items-center gap-3">
                                        <Image width={48} height={48} src={pdfAssets.logoUrl} preview={false} style={{ objectFit: 'contain' }} />
                                        <Button danger onClick={() => updatePdfAssets({ logoUrl: '' })}>Xoá</Button>
                                    </div>
                                ) : (
                                    <Text type="secondary">Chưa có logo</Text>
                                )}
                            </Space>
                        </Card>

                        <Card size="small" title="Banner gradient (tuỳ chọn)">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {(() => {
                                    const parsed = parseLinearGradient(pdfAssets?.bannerGradient)
                                    const currentAngle = parsed.angle
                                    const currentStart = parsed.start
                                    const currentEnd = parsed.end

                                    const apply = (next) => updatePdfAssets({ bannerGradient: next })

                                    return (
                                        <>
                                            <div
                                                className="h-10 rounded border border-gray-200"
                                                style={{ background: parsed.raw }}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <Text strong className="block mb-1">Màu bắt đầu</Text>
                                                    <ColorPicker
                                                        value={currentStart}
                                                        onChange={(_, hex) => apply(buildLinearGradient({ angle: currentAngle, start: hex, end: currentEnd }))}
                                                        showText
                                                    />
                                                </div>
                                                <div>
                                                    <Text strong className="block mb-1">Màu kết thúc</Text>
                                                    <ColorPicker
                                                        value={currentEnd}
                                                        onChange={(_, hex) => apply(buildLinearGradient({ angle: currentAngle, start: currentStart, end: hex }))}
                                                        showText
                                                    />
                                                </div>
                                                <div>
                                                    <Text strong className="block mb-1">Góc (deg)</Text>
                                                    <InputNumber
                                                        min={0}
                                                        max={360}
                                                        value={currentAngle}
                                                        onChange={(v) => apply(buildLinearGradient({ angle: Number(v ?? 90), start: currentStart, end: currentEnd }))}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>

                                            <Space>
                                                <Button onClick={() => updatePdfAssets({ bannerGradient: '' })}>
                                                    Dùng mặc định
                                                </Button>
                                            </Space>

                                            <Divider className="my-2" />

                                            <Text strong className="block mb-1">Nâng cao (CSS tuỳ chọn)</Text>
                                            <Input
                                                value={pdfAssets?.bannerGradient || ''}
                                                onChange={(e) => updatePdfAssets({ bannerGradient: e.target.value })}
                                                placeholder={DEFAULT_BANNER_GRADIENT}
                                            />
                                            <Text type="secondary" className="text-xs">
                                                Bạn có thể để trống để dùng mặc định; hoặc dán CSS gradient nếu cần.
                                            </Text>
                                        </>
                                    )
                                })()}
                            </Space>
                        </Card>

                        <Card size="small" title="Ảnh Thalassaemia">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={async (file) => {
                                        try {
                                            const dataUrl = await readAsDataUrl(file)
                                            updatePdfAssets({ thalassemiaImageUrl: dataUrl })
                                            message.success('Đã cập nhật ảnh Thalassaemia')
                                        } catch {
                                            message.error('Không đọc được file ảnh')
                                        }
                                        return false
                                    }}
                                >
                                    <Button>Chọn ảnh</Button>
                                </Upload>
                                {pdfAssets?.thalassemiaImageUrl ? (
                                    <div className="flex items-center gap-3">
                                        <Image width={64} height={64} src={pdfAssets.thalassemiaImageUrl} preview={false} style={{ objectFit: 'contain' }} />
                                        <Button danger onClick={() => updatePdfAssets({ thalassemiaImageUrl: '' })}>Xoá</Button>
                                    </div>
                                ) : (
                                    <Text type="secondary">Chưa có ảnh</Text>
                                )}
                            </Space>
                        </Card>

                        <Card size="small" title="Organ icons">
                            <div className="space-y-3">
                                {organIconItems.map((it) => (
                                    <div key={it.key} className="flex items-center justify-between gap-3 border rounded p-2">
                                        <div className="min-w-[180px]">
                                            <Text strong>{it.label}</Text>
                                            <div><Text type="secondary" className="text-xs">Key: {it.key}</Text></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pdfAssets?.organIcons?.[it.key] ? (
                                                <Image width={32} height={32} src={pdfAssets.organIcons[it.key]} preview={false} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded" />
                                            )}
                                            <Upload
                                                accept="image/*"
                                                showUploadList={false}
                                                beforeUpload={async (file) => {
                                                    try {
                                                        const dataUrl = await readAsDataUrl(file)
                                                        updatePdfAssets({ organIcons: { [it.key]: dataUrl } })
                                                        message.success(`Đã cập nhật icon: ${it.label}`)
                                                    } catch {
                                                        message.error('Không đọc được file ảnh')
                                                    }
                                                    return false
                                                }}
                                            >
                                                <Button>Chọn</Button>
                                            </Upload>
                                            <Button
                                                danger
                                                disabled={!pdfAssets?.organIcons?.[it.key]}
                                                onClick={() => updatePdfAssets({ organIcons: { [it.key]: '' } })}
                                            >
                                                Xoá
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Divider />
                            <Space>
                                <Button onClick={resetPdfAssets}>Reset PDF assets</Button>
                            </Space>
                        </Card>

                        <Card size="small" title="Deep Dive icons (tuỳ chọn)">
                            <div className="space-y-3">
                                {deepDiveIconItems.map((it) => (
                                    <div key={it.key} className="flex items-center justify-between gap-3 border rounded p-2">
                                        <div className="min-w-[180px]">
                                            <Text strong>{it.label}</Text>
                                            <div><Text type="secondary" className="text-xs">Key: {it.key}</Text></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pdfAssets?.deepDiveIcons?.[it.key] ? (
                                                <Image width={44} height={44} src={pdfAssets.deepDiveIcons[it.key]} preview={false} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <div className="w-11 h-11 bg-gray-100 border border-gray-200 rounded" />
                                            )}
                                            <Upload
                                                accept="image/*"
                                                showUploadList={false}
                                                beforeUpload={async (file) => {
                                                    try {
                                                        const dataUrl = await readAsDataUrl(file)
                                                        updatePdfAssets({ deepDiveIcons: { [it.key]: dataUrl } })
                                                        message.success(`Đã cập nhật icon: ${it.label}`)
                                                    } catch {
                                                        message.error('Không đọc được file ảnh')
                                                    }
                                                    return false
                                                }}
                                            >
                                                <Button>Chọn</Button>
                                            </Upload>
                                            <Button
                                                danger
                                                disabled={!pdfAssets?.deepDiveIcons?.[it.key]}
                                                onClick={() => updatePdfAssets({ deepDiveIcons: { [it.key]: '' } })}
                                            >
                                                Xoá
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card size="small" title="Evaluation icons (tuỳ chọn)">
                            <div className="space-y-3">
                                {evaluationIconItems.map((it) => (
                                    <div key={it.key} className="flex items-center justify-between gap-3 border rounded p-2">
                                        <div className="min-w-[180px]">
                                            <Text strong>{it.label}</Text>
                                            <div><Text type="secondary" className="text-xs">Key: {it.key}</Text></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pdfAssets?.evaluationIcons?.[it.key] ? (
                                                <Image width={44} height={44} src={pdfAssets.evaluationIcons[it.key]} preview={false} style={{ objectFit: 'contain' }} />
                                            ) : (
                                                <div className="w-11 h-11 bg-gray-100 border border-gray-200 rounded" />
                                            )}
                                            <Upload
                                                accept="image/*"
                                                showUploadList={false}
                                                beforeUpload={async (file) => {
                                                    try {
                                                        const dataUrl = await readAsDataUrl(file)
                                                        updatePdfAssets({ evaluationIcons: { [it.key]: dataUrl } })
                                                        message.success(`Đã cập nhật icon: ${it.label}`)
                                                    } catch {
                                                        message.error('Không đọc được file ảnh')
                                                    }
                                                    return false
                                                }}
                                            >
                                                <Button>Chọn</Button>
                                            </Upload>
                                            <Button
                                                danger
                                                disabled={!pdfAssets?.evaluationIcons?.[it.key]}
                                                onClick={() => updatePdfAssets({ evaluationIcons: { [it.key]: '' } })}
                                            >
                                                Xoá
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card size="small" title="Thanh 5 mức (màu & marker)">
                            <div className="space-y-4">
                                <div>
                                    <Text strong className="block mb-2">Màu 5 ô</Text>
                                    <div className="grid grid-cols-5 gap-2">
                                        {(pdfAssets?.fiveLevelBar?.colors || []).map((c, idx) => (
                                            <div key={idx} className="text-center">
                                                <ColorPicker
                                                    value={c}
                                                    onChange={(_, hex) => {
                                                        const next = [...(pdfAssets?.fiveLevelBar?.colors || [])]
                                                        next[idx] = hex
                                                        updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, colors: next } })
                                                    }}
                                                />
                                                <div className="text-xs text-gray-500 mt-1">Ô {idx + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Text strong className="block mb-1">Marker size</Text>
                                        <InputNumber
                                            min={10}
                                            max={40}
                                            value={pdfAssets?.fiveLevelBar?.markerSize}
                                            onChange={(v) => updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerSize: v } })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <Text strong className="block mb-1">Marker color</Text>
                                        <ColorPicker
                                            value={pdfAssets?.fiveLevelBar?.markerColor}
                                            onChange={(_, hex) => updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerColor: hex } })}
                                        />
                                    </div>
                                    <div>
                                        <Text strong className="block mb-1">Marker stroke color</Text>
                                        <ColorPicker
                                            value={pdfAssets?.fiveLevelBar?.markerStrokeColor}
                                            onChange={(_, hex) => updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerStrokeColor: hex } })}
                                        />
                                    </div>
                                    <div>
                                        <Text strong className="block mb-1">Marker stroke width</Text>
                                        <InputNumber
                                            min={0}
                                            max={6}
                                            step={0.5}
                                            value={pdfAssets?.fiveLevelBar?.markerStrokeWidth}
                                            onChange={(v) => updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerStrokeWidth: v } })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Text strong className="block mb-2">Marker image (tuỳ chọn)</Text>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Upload
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={async (file) => {
                                                try {
                                                    const dataUrl = await readAsDataUrl(file)
                                                    updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerImageUrl: dataUrl } })
                                                    message.success('Đã cập nhật marker image')
                                                } catch {
                                                    message.error('Không đọc được file ảnh')
                                                }
                                                return false
                                            }}
                                        >
                                            <Button>Chọn ảnh marker</Button>
                                        </Upload>
                                        {pdfAssets?.fiveLevelBar?.markerImageUrl ? (
                                            <div className="flex items-center gap-3">
                                                <Image width={48} height={48} src={pdfAssets.fiveLevelBar.markerImageUrl} preview={false} style={{ objectFit: 'contain' }} />
                                                <Button danger onClick={() => updatePdfAssets({ fiveLevelBar: { ...pdfAssets.fiveLevelBar, markerImageUrl: '' } })}>Xoá</Button>
                                            </div>
                                        ) : (
                                            <Text type="secondary">Đang dùng marker SVG mặc định</Text>
                                        )}
                                    </Space>
                                </div>
                            </div>
                        </Card>

                        <Card size="small" title="Đồng hồ Health Score (màu & độ dày)">
                            <div className="space-y-4">
                                <div>
                                    <Text strong className="block mb-2">Màu 8 segment</Text>
                                    <div className="grid grid-cols-8 gap-2">
                                        {Array.from({ length: 8 }).map((_, idx) => {
                                            const current = (pdfAssets?.healthGauge?.segmentColors || [])
                                            const c = current[idx] || DEFAULT_HEALTH_GAUGE_COLORS[idx]
                                            return (
                                            <div key={idx} className="text-center">
                                                <ColorPicker
                                                    value={c}
                                                    onChange={(_, hex) => {
                                                        const next = Array.from({ length: 8 }).map((__, i) => current[i] || DEFAULT_HEALTH_GAUGE_COLORS[i])
                                                        next[idx] = hex
                                                        updatePdfAssets({ healthGauge: { ...pdfAssets.healthGauge, segmentColors: next } })
                                                    }}
                                                />
                                                <div className="text-xs text-gray-500 mt-1">Seg {idx + 1}</div>
                                            </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Text strong className="block mb-1">Arc thickness</Text>
                                        <InputNumber
                                            min={10}
                                            max={40}
                                            value={pdfAssets?.healthGauge?.arcThickness}
                                            onChange={(v) => updatePdfAssets({ healthGauge: { ...pdfAssets.healthGauge, arcThickness: v } })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <Text strong className="block mb-1">Needle color</Text>
                                        <ColorPicker
                                            value={pdfAssets?.healthGauge?.needleColor}
                                            onChange={(_, hex) => updatePdfAssets({ healthGauge: { ...pdfAssets.healthGauge, needleColor: hex } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Card>
            )
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Title level={2} className="mb-0">⚙️ Cài đặt ngưỡng</Title>
                    <Text type="secondary">
                        Cấu hình ngưỡng để tự động tính toán Thấp/Bình thường/Cao cho các chỉ số
                    </Text>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                        Khôi phục mặc định
                    </Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                        Lưu cài đặt
                    </Button>
                </Space>
            </div>

            <Tabs items={tabItems} type="card" />

            <Divider />

            <Card title="📖 Hướng dẫn sử dụng" size="small">
                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Sinh hóa máu:</strong> Khi nhập giá trị cho chỉ số, hệ thống sẽ tự động xác định:</p>
                    <ul className="list-disc ml-6">
                        <li>Giá trị &lt; Ngưỡng thấp → <span className="text-purple-600 font-medium">Thấp</span></li>
                        <li>Ngưỡng thấp ≤ Giá trị ≤ Ngưỡng cao → <span className="text-green-600 font-medium">Bình thường</span></li>
                        <li>Giá trị &gt; Ngưỡng cao → <span className="text-red-600 font-medium">Cao</span></li>
                    </ul>
                    <p className="mt-4"><strong>Thanh 5 mức:</strong> Sử dụng cho các chỉ số rủi ro (tim mạch, gan, viêm). Mỗi mức tương ứng một màu từ xanh (tốt) đến đỏ (kém).</p>
                </div>
            </Card>
        </div>
    )
}

export default SettingsPage
