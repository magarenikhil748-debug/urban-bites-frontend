'use client'

import {
  CheckCircle2,
  ChefHat,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  MenuSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  DashboardError,
  DashboardLoading,
  DashboardNotice,
  DashboardPageHeader,
  DashboardStatCard,
} from '@/components/dashboard/DashboardPrimitives'
import { useDashboard } from '@/components/dashboard/DashboardProvider'
import {
  canManageRestaurant,
  canToggleAvailability,
  dashboardApiRequest,
  formatDashboardPrice,
} from '@/lib/dashboard-api'

type FoodType = 'VEG' | 'NON_VEG' | 'EGG' | 'JAIN' | 'BEVERAGE'

type MenuItem = {
  id: string
  restaurantId: string
  branchId: string | null
  categoryId: string
  name: string
  description: string | null
  priceInPaise: number
  imageUrl: string | null
  foodType: FoodType
  isAvailable: boolean
  isRecommended: boolean
  isActive: boolean
  preparationTimeMinutes: number | null
  sortOrder: number
}

type MenuCategory = {
  id: string
  restaurantId: string
  branchId: string | null
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  items: MenuItem[]
}

type CategoryForm = {
  id?: string
  name: string
  description: string
  sortOrder: string
}

type ItemForm = {
  id?: string
  categoryId: string
  name: string
  description: string
  price: string
  imageUrl: string
  foodType: FoodType
  isAvailable: boolean
  isRecommended: boolean
  preparationTimeMinutes: string
  sortOrder: string
}

const emptyCategoryForm: CategoryForm = {
  name: '',
  description: '',
  sortOrder: '0',
}

const newItemForm = (categoryId = ''): ItemForm => ({
  categoryId,
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  foodType: 'VEG',
  isAvailable: true,
  isRecommended: false,
  preparationTimeMinutes: '',
  sortOrder: '0',
})

const foodTypeLabel: Record<FoodType, string> = {
  VEG: 'Veg',
  NON_VEG: 'Non-veg',
  EGG: 'Contains egg',
  JAIN: 'Jain',
  BEVERAGE: 'Beverage',
}

export default function MenuManagementPage() {
  const { session, selectedRestaurantId, selectedMembership } = useDashboard()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>(
    'ALL',
  )
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null)
  const [itemForm, setItemForm] = useState<ItemForm | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const canManage = canManageRestaurant(selectedMembership?.role)
  const canToggle = canToggleAvailability(selectedMembership?.role)
  const currency = selectedMembership?.restaurant.currency ?? 'INR'

  const load = useCallback(async () => {
    if (!session || !selectedRestaurantId) return
    try {
      setLoading(true)
      setError('')
      const data = await dashboardApiRequest<{ categories: MenuCategory[] }>(
        `/api/v1/restaurants/${selectedRestaurantId}/categories`,
        { token: session.accessToken },
      )
      setCategories(data.categories)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load menu.')
    } finally {
      setLoading(false)
    }
  }, [selectedRestaurantId, session])

  useEffect(() => {
    void load()
  }, [load])

  const items = useMemo(() => categories.flatMap((category) => category.items), [categories])
  const stats = {
    total: items.length,
    available: items.filter((item) => item.isAvailable).length,
    unavailable: items.filter((item) => !item.isAvailable).length,
  }

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    return categories
      .filter((category) => categoryFilter === 'ALL' || category.id === categoryFilter)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (availabilityFilter === 'AVAILABLE' && !item.isAvailable) return false
          if (availabilityFilter === 'UNAVAILABLE' && item.isAvailable) return false
          if (!query) return true
          return [item.name, item.description, category.name].some((value) =>
            value?.toLowerCase().includes(query),
          )
        }),
      }))
      .filter((category) => category.items.length > 0 || (!query && availabilityFilter === 'ALL'))
  }, [availabilityFilter, categories, categoryFilter, search])

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !selectedRestaurantId || !categoryForm || !canManage || submitting) return
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
        sortOrder: Number(categoryForm.sortOrder) || 0,
      }
      if (categoryForm.id) {
        await dashboardApiRequest(`/api/v1/categories/${categoryForm.id}`, {
          method: 'PATCH',
          token: session.accessToken,
          body: JSON.stringify(payload),
        })
        setSuccess('Category updated.')
      } else {
        await dashboardApiRequest(`/api/v1/restaurants/${selectedRestaurantId}/categories`, {
          method: 'POST',
          token: session.accessToken,
          body: JSON.stringify(payload),
        })
        setSuccess('Category created.')
      }
      setCategoryForm(null)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save category.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !itemForm || !canManage || submitting) return
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      const rupees = Number(itemForm.price)
      if (!Number.isFinite(rupees) || rupees < 0) {
        throw new Error('Enter a valid item price.')
      }
      const payload = {
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || undefined,
        priceInPaise: Math.round(rupees * 100),
        imageUrl: itemForm.imageUrl.trim() || undefined,
        foodType: itemForm.foodType,
        isAvailable: itemForm.isAvailable,
        isRecommended: itemForm.isRecommended,
        preparationTimeMinutes: itemForm.preparationTimeMinutes
          ? Number(itemForm.preparationTimeMinutes)
          : undefined,
        sortOrder: Number(itemForm.sortOrder) || 0,
      }

      if (itemForm.id) {
        await dashboardApiRequest(`/api/v1/items/${itemForm.id}`, {
          method: 'PATCH',
          token: session.accessToken,
          body: JSON.stringify(payload),
        })
        setSuccess('Menu item updated.')
      } else {
        await dashboardApiRequest(`/api/v1/categories/${itemForm.categoryId}/items`, {
          method: 'POST',
          token: session.accessToken,
          body: JSON.stringify(payload),
        })
        setSuccess('Menu item created.')
      }
      setItemForm(null)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save menu item.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    if (!session || !canToggle || updatingItemId) return
    try {
      setUpdatingItemId(item.id)
      setError('')
      await dashboardApiRequest(`/api/v1/items/${item.id}/availability`, {
        method: 'PATCH',
        token: session.accessToken,
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })
      setCategories((current) =>
        current.map((category) => ({
          ...category,
          items: category.items.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, isAvailable: !currentItem.isAvailable }
              : currentItem,
          ),
        })),
      )
      setSuccess(`${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}.`)
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'Unable to update availability.',
      )
    } finally {
      setUpdatingItemId(null)
    }
  }

  const deleteItem = async (item: MenuItem) => {
    if (!session || !canManage || !window.confirm(`Remove ${item.name} from the active menu?`)) {
      return
    }
    try {
      setUpdatingItemId(item.id)
      await dashboardApiRequest(`/api/v1/items/${item.id}`, {
        method: 'DELETE',
        token: session.accessToken,
      })
      setSuccess(`${item.name} was removed from the active menu.`)
      await load()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to remove item.')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const deleteCategory = async (category: MenuCategory) => {
    if (
      !session ||
      !canManage ||
      !window.confirm(
        `Deactivate ${category.name}? Existing items in this category will no longer appear publicly.`,
      )
    ) {
      return
    }
    try {
      setSubmitting(true)
      await dashboardApiRequest(`/api/v1/categories/${category.id}`, {
        method: 'DELETE',
        token: session.accessToken,
      })
      setSuccess(`${category.name} was deactivated.`)
      if (categoryFilter === category.id) setCategoryFilter('ALL')
      await load()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to remove category.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardLoading label="Loading menu manager" />
  if (error && categories.length === 0)
    return <DashboardError message={error} onRetry={() => void load()} />

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        eyebrow="Digital menu control"
        title="Menu management"
        description="Build the menu customers actually see, keep availability accurate in real time, and organize the kitchen-ready details behind every item."
        actions={
          canManage ? (
            <>
              <button
                type="button"
                onClick={() => setCategoryForm(emptyCategoryForm)}
                className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/65 hover:text-white"
              >
                <Plus size={16} /> New category
              </button>
              <button
                type="button"
                disabled={categories.length === 0}
                onClick={() =>
                  setItemForm(
                    newItemForm(categoryFilter === 'ALL' ? categories[0]?.id : categoryFilter),
                  )
                }
                className="flex min-h-12 items-center gap-2 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f] disabled:opacity-40"
              >
                <Plus size={16} /> New item
              </button>
            </>
          ) : undefined
        }
      />

      {!canManage && (
        <DashboardNotice
          title={canToggle ? 'Kitchen availability access' : 'Read-only menu access'}
          message={
            canToggle
              ? 'You can toggle item availability, while category and item editing remains limited to owners and managers.'
              : 'Your membership can view the menu, but editing requires an owner or manager role.'
          }
          tone="warning"
        />
      )}
      {success && <DashboardNotice title="Menu updated" message={success} tone="success" />}
      {error && <DashboardError message={error} />}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardStatCard
          icon={MenuSquare}
          label="Total items"
          value={stats.total}
          detail="Active menu items"
          tone="blue"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Available"
          value={stats.available}
          detail="Visible to customers"
          tone="green"
        />
        <DashboardStatCard
          icon={EyeOff}
          label="Unavailable"
          value={stats.unavailable}
          detail="Temporarily hidden"
          tone="rose"
        />
        <DashboardStatCard
          icon={ChefHat}
          label="Categories"
          value={categories.length}
          detail="Active menu sections"
          tone="amber"
        />
      </section>

      <section className="rounded-[1.6rem] border border-white/[0.07] bg-[#111a16] p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item, description, or category"
              className="dashboard-input pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              ['ALL', 'All'],
              ['AVAILABLE', 'Available'],
              ['UNAVAILABLE', 'Unavailable'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAvailabilityFilter(value as typeof availabilityFilter)}
                className={`min-h-11 shrink-0 rounded-xl px-4 text-xs font-black ${
                  availabilityFilter === value
                    ? 'bg-[#e8b968] text-[#17251f]'
                    : 'border border-white/[0.07] text-white/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-black ${
              categoryFilter === 'ALL' ? 'bg-white text-[#17251f]' : 'bg-white/[0.04] text-white/40'
            }`}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-black ${
                categoryFilter === category.id
                  ? 'bg-white text-[#17251f]'
                  : 'bg-white/[0.04] text-white/40'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/10 bg-[#111a16] px-6 py-16 text-center">
          <MenuSquare size={34} className="mx-auto text-[#e8b968]" />
          <h2 className="mt-5 font-display text-3xl font-bold">
            Start building your digital menu.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
            Create the first category, then add items customers can browse and order.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setCategoryForm(emptyCategoryForm)}
              className="mt-6 min-h-12 rounded-2xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f]"
            >
              Create first category
            </button>
          )}
        </section>
      ) : visibleCategories.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/10 bg-[#111a16] px-6 py-14 text-center">
          <Search size={30} className="mx-auto text-white/20" />
          <h2 className="mt-4 text-xl font-black">No menu items match these filters.</h2>
          <p className="mt-2 text-sm text-white/30">Try another search or availability filter.</p>
        </section>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((category) => (
            <section
              key={category.id}
              className="rounded-[1.8rem] border border-white/[0.07] bg-[#111a16] p-5 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e8b968]">
                    Menu category
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{category.name}</h2>
                  {category.description && (
                    <p className="mt-1 text-sm text-white/35">{category.description}</p>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryForm({
                          id: category.id,
                          name: category.name,
                          description: category.description ?? '',
                          sortOrder: String(category.sortOrder),
                        })
                      }
                      aria-label={`Edit ${category.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/40 hover:text-white"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteCategory(category)}
                      aria-label={`Deactivate ${category.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/15 text-rose-300/60 hover:bg-rose-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {category.items.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-5 py-9 text-center">
                  <p className="text-sm text-white/35">No items in this category yet.</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setItemForm(newItemForm(category.id))}
                      className="mt-3 text-xs font-black text-[#e8b968]"
                    >
                      Add the first item
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      canManage={canManage}
                      canToggle={canToggle}
                      updating={updatingItemId === item.id}
                      onToggle={() => void toggleAvailability(item)}
                      onEdit={() =>
                        setItemForm({
                          id: item.id,
                          categoryId: item.categoryId,
                          name: item.name,
                          description: item.description ?? '',
                          price: String(item.priceInPaise / 100),
                          imageUrl: item.imageUrl ?? '',
                          foodType: item.foodType,
                          isAvailable: item.isAvailable,
                          isRecommended: item.isRecommended,
                          preparationTimeMinutes: item.preparationTimeMinutes
                            ? String(item.preparationTimeMinutes)
                            : '',
                          sortOrder: String(item.sortOrder),
                        })
                      }
                      onDelete={() => void deleteItem(item)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {categoryForm && (
        <Modal
          title={categoryForm.id ? 'Edit category' : 'Create category'}
          onClose={() => setCategoryForm(null)}
        >
          <form onSubmit={saveCategory} className="space-y-4">
            <ModalField label="Category name">
              <input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                required
                className="dashboard-input"
              />
            </ModalField>
            <ModalField label="Description">
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm({ ...categoryForm, description: event.target.value })
                }
                rows={3}
                className="dashboard-input resize-none py-3"
              />
            </ModalField>
            <ModalField label="Sort order">
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(event) =>
                  setCategoryForm({ ...categoryForm, sortOrder: event.target.value })
                }
                className="dashboard-input"
              />
            </ModalField>
            <ModalActions submitting={submitting} onCancel={() => setCategoryForm(null)} />
          </form>
        </Modal>
      )}

      {itemForm && (
        <Modal
          title={itemForm.id ? 'Edit menu item' : 'Create menu item'}
          onClose={() => setItemForm(null)}
        >
          <form onSubmit={saveItem} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Item name">
                <input
                  value={itemForm.name}
                  onChange={(event) => setItemForm({ ...itemForm, name: event.target.value })}
                  required
                  className="dashboard-input"
                />
              </ModalField>
              <ModalField label="Category">
                <select
                  value={itemForm.categoryId}
                  onChange={(event) => setItemForm({ ...itemForm, categoryId: event.target.value })}
                  disabled={Boolean(itemForm.id)}
                  required
                  className="dashboard-input"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </ModalField>
              <ModalField label={`Price (${currency})`}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(event) => setItemForm({ ...itemForm, price: event.target.value })}
                  required
                  className="dashboard-input"
                />
              </ModalField>
              <ModalField label="Food type">
                <select
                  value={itemForm.foodType}
                  onChange={(event) =>
                    setItemForm({ ...itemForm, foodType: event.target.value as FoodType })
                  }
                  className="dashboard-input"
                >
                  {Object.entries(foodTypeLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </ModalField>
              <ModalField label="Preparation time (minutes)">
                <input
                  type="number"
                  min="1"
                  value={itemForm.preparationTimeMinutes}
                  onChange={(event) =>
                    setItemForm({ ...itemForm, preparationTimeMinutes: event.target.value })
                  }
                  className="dashboard-input"
                />
              </ModalField>
              <ModalField label="Sort order">
                <input
                  type="number"
                  value={itemForm.sortOrder}
                  onChange={(event) => setItemForm({ ...itemForm, sortOrder: event.target.value })}
                  className="dashboard-input"
                />
              </ModalField>
              <ModalField label="Image URL" className="sm:col-span-2">
                <input
                  type="url"
                  value={itemForm.imageUrl}
                  onChange={(event) => setItemForm({ ...itemForm, imageUrl: event.target.value })}
                  className="dashboard-input"
                />
              </ModalField>
              <ModalField label="Description" className="sm:col-span-2">
                <textarea
                  value={itemForm.description}
                  onChange={(event) =>
                    setItemForm({ ...itemForm, description: event.target.value })
                  }
                  rows={3}
                  className="dashboard-input resize-none py-3"
                />
              </ModalField>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleField
                label="Available to order"
                checked={itemForm.isAvailable}
                onChange={(checked) => setItemForm({ ...itemForm, isAvailable: checked })}
              />
              <ToggleField
                label="Recommended item"
                checked={itemForm.isRecommended}
                onChange={(checked) => setItemForm({ ...itemForm, isRecommended: checked })}
              />
            </div>
            {itemForm.id && (
              <p className="rounded-xl bg-amber-400/[0.07] p-3 text-xs leading-5 text-amber-100/55">
                The current item update API does not support moving an existing item to another
                category. Create a new item in the target category if reassignment is required.
              </p>
            )}
            <ModalActions submitting={submitting} onCancel={() => setItemForm(null)} />
          </form>
        </Modal>
      )}
    </div>
  )
}

function MenuItemCard({
  item,
  currency,
  canManage,
  canToggle,
  updating,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: MenuItem
  currency: string
  canManage: boolean
  canToggle: boolean
  updating: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${item.isAvailable ? 'border-white/[0.07] bg-white/[0.03]' : 'border-white/[0.05] bg-black/15 opacity-70'}`}
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.05]">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={23} className="text-white/18" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-black">{item.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span
                  className={item.foodType === 'NON_VEG' ? 'text-rose-300' : 'text-emerald-300'}
                >
                  {foodTypeLabel[item.foodType]}
                </span>
                {item.isRecommended && (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Sparkles size={10} /> Recommended
                  </span>
                )}
              </div>
            </div>
            <p className="shrink-0 text-sm font-black text-[#e8b968]">
              {formatDashboardPrice(item.priceInPaise, currency)}
            </p>
          </div>
          {item.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/32">{item.description}</p>
          )}
          {item.preparationTimeMinutes && (
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/28">
              <Clock3 size={12} /> {item.preparationTimeMinutes} min
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!canToggle || updating}
          className={`flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-black ${
            item.isAvailable
              ? 'bg-emerald-400/10 text-emerald-300'
              : 'bg-white/[0.05] text-white/35'
          } disabled:cursor-not-allowed`}
        >
          {updating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : item.isAvailable ? (
            <Eye size={13} />
          ) : (
            <EyeOff size={13} />
          )}
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </button>
        {canManage && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${item.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 hover:bg-white/[0.05] hover:text-white"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${item.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-300/45 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#111a16] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-white/45"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function ModalField({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-white/38">{label}</span>
      {children}
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.07] bg-black/15 p-4">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#e8b968]"
      />
    </label>
  )
}

function ModalActions({ submitting, onCancel }: { submitting: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 border-t border-white/[0.07] pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-black text-white/45"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-[#e8b968] px-5 text-sm font-black text-[#17251f] disabled:opacity-60"
      >
        {submitting && <Loader2 size={15} className="animate-spin" />}
        Save
      </button>
    </div>
  )
}
