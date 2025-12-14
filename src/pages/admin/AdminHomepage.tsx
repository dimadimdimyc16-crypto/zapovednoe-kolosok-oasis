import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Layout,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Type,
  Building,
  MessageSquare,
  Save,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

const blockTypes = [
  { value: "hero", label: "Hero-блок", icon: Image },
  { value: "catalog", label: "Каталог объектов", icon: Building },
  { value: "text", label: "Текстовая секция", icon: Type },
  { value: "banner", label: "Баннер", icon: Image },
  { value: "cta", label: "Призыв к действию", icon: MessageSquare },
];

export const AdminHomepage = () => {
  const queryClient = useQueryClient();
  const [settlement, setSettlement] = useState<"zapovednoe" | "kolosok">("zapovednoe");
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["homepage-blocks", settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_blocks")
        .select("*")
        .eq("settlement", settlement)
        .order("block_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (blockType: string) => {
      const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b: any) => b.block_order)) : -1;
      const { error } = await supabase.from("homepage_blocks").insert({
        settlement,
        block_type: blockType,
        block_order: maxOrder + 1,
        is_enabled: true,
        content: getDefaultContent(blockType),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-blocks"] });
      toast.success("Блок добавлен");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("homepage_blocks")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-blocks"] });
      toast.success("Блок обновлен");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("homepage_blocks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-blocks"] });
      toast.success("Блок удален");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; block_order: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("homepage_blocks")
          .update({ block_order: update.block_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-blocks"] });
    },
  });

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "hero":
        return {
          title: "Заголовок",
          subtitle: "Подзаголовок",
          buttonText: "Подробнее",
          buttonLink: "/",
          backgroundImage: "",
        };
      case "catalog":
        return {
          title: "Каталог домов",
          showCount: 6,
          filterByStatus: "available",
        };
      case "text":
        return {
          title: "Заголовок секции",
          content: "Текст секции...",
        };
      case "banner":
        return {
          title: "Баннер",
          description: "Описание",
          imageUrl: "",
          link: "/",
        };
      case "cta":
        return {
          title: "Призыв к действию",
          description: "Описание",
          buttonText: "Действие",
          buttonLink: "/",
        };
      default:
        return {};
    }
  };

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updates = [
      { id: blocks[index].id, block_order: blocks[newIndex].block_order },
      { id: blocks[newIndex].id, block_order: blocks[index].block_order },
    ];

    reorderMutation.mutate(updates);
  }, [blocks, reorderMutation]);

  const toggleBlock = (id: string, isEnabled: boolean) => {
    updateBlockMutation.mutate({ id, data: { is_enabled: isEnabled } });
  };

  const saveBlockContent = (id: string, content: any) => {
    updateBlockMutation.mutate({ id, data: { content } });
    setEditingBlock(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layout className="h-8 w-8" />
              Конструктор главной страницы
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление блоками главной страницы ({blocks.length} блоков)
            </p>
          </div>

          <Select
            value={settlement}
            onValueChange={(v: "zapovednoe" | "kolosok") => setSettlement(v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zapovednoe">Заповедное</SelectItem>
              <SelectItem value="kolosok">Колосок</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Block */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Добавить блок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blockTypes.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => createBlockMutation.mutate(type.value)}
                  disabled={createBlockMutation.isPending}
                >
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blocks List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </Card>
          ) : blocks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Нет блоков. Добавьте первый блок выше.
            </Card>
          ) : (
            blocks.map((block: any, index: number) => {
              const blockType = blockTypes.find((t) => t.value === block.block_type);
              const BlockIcon = blockType?.icon || Layout;
              const content = block.content || {};

              return (
                <Card key={block.id} className={!block.is_enabled ? "opacity-50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(index, "up")}
                            disabled={index === 0 || reorderMutation.isPending}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(index, "down")}
                            disabled={index === blocks.length - 1 || reorderMutation.isPending}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <BlockIcon className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            {blockType?.label || block.block_type}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Порядок: {block.block_order + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Активен</Label>
                          <Switch
                            checked={block.is_enabled}
                            onCheckedChange={(checked) => toggleBlock(block.id, checked)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Удалить этот блок?")) {
                              deleteBlockMutation.mutate(block.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingBlock?.id === block.id ? (
                      <BlockEditor
                        block={block}
                        onSave={(content) => saveBlockContent(block.id, content)}
                        onCancel={() => setEditingBlock(null)}
                        isLoading={updateBlockMutation.isPending}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground space-y-1">
                          {content.title && <p><strong>Заголовок:</strong> {content.title}</p>}
                          {content.subtitle && <p><strong>Подзаголовок:</strong> {content.subtitle}</p>}
                          {content.buttonText && <p><strong>Кнопка:</strong> {content.buttonText}</p>}
                          {content.showCount && <p><strong>Кол-во объектов:</strong> {content.showCount}</p>}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBlock(block)}
                        >
                          Редактировать
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const BlockEditor = ({
  block,
  onSave,
  onCancel,
  isLoading,
}: {
  block: any;
  onSave: (content: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [content, setContent] = useState(block.content || {});

  const updateField = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {block.block_type === "hero" && (
        <>
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Input
              value={content.subtitle || ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Текст кнопки</Label>
              <Input
                value={content.buttonText || ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ссылка кнопки</Label>
              <Input
                value={content.buttonLink || ""}
                onChange={(e) => updateField("buttonLink", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL фонового изображения</Label>
            <Input
              value={content.backgroundImage || ""}
              onChange={(e) => updateField("backgroundImage", e.target.value)}
            />
          </div>
        </>
      )}

      {block.block_type === "text" && (
        <>
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Содержание</Label>
            <Textarea
              value={content.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
              rows={5}
            />
          </div>
        </>
      )}

      {block.block_type === "catalog" && (
        <>
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Количество объектов</Label>
              <Input
                type="number"
                value={content.showCount || 6}
                onChange={(e) => updateField("showCount", parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Фильтр по статусу</Label>
              <Select
                value={content.filterByStatus || "available"}
                onValueChange={(v) => updateField("filterByStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="available">В продаже</SelectItem>
                  <SelectItem value="reserved">Забронированы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {(block.block_type === "banner" || block.block_type === "cta") && (
        <>
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={content.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Текст кнопки</Label>
              <Input
                value={content.buttonText || ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ссылка</Label>
              <Input
                value={content.buttonLink || content.link || ""}
                onChange={(e) => updateField("buttonLink", e.target.value)}
              />
            </div>
          </div>
          {block.block_type === "banner" && (
            <div className="space-y-2">
              <Label>URL изображения</Label>
              <Input
                value={content.imageUrl || ""}
                onChange={(e) => updateField("imageUrl", e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(content)} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default AdminHomepage;
