import { useState } from 'react';
import { saveDescription, addLink, addOwner, addTag } from '@/features/data-catalog/components/services/dataService';
import { toast } from 'sonner';
import { Owner, Link, AboutData } from '@/features/data-catalog/types';

export function useAboutData(initialData: AboutData) {
  const [description, setDescription] = useState(initialData.description || '');
  const [owners, setOwners] = useState<Owner[]>(initialData.owners || []);
  const [links, setLinks] = useState<Link[]>(initialData.links || []);
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleAddLink = async (newLink: Link) => {
    try {
      await addLink(newLink);
      setLinks([...links, newLink]);
      setLastUpdated(new Date());
      toast.success('Link added successfully');
    } catch (error) {
      toast.error('Failed to add link');
    }
  };

  const handleAddOwner = async (newOwner: Omit<Owner, 'id'>) => {
    try {
      const owner: Owner = {
        ...newOwner,
        id: Math.random().toString(36).substr(2, 9),
      };
      await addOwner(owner);
      setOwners([...owners, owner]);
      setLastUpdated(new Date());
      toast.success('Owner added successfully');
    } catch (error) {
      toast.error('Failed to add owner');
    }
  };

  const handleAddTag = async (newTag: string) => {
    try {
      await addTag(newTag);
      setTags([...tags, newTag]);
      setLastUpdated(new Date());
      toast.success('Tag added successfully');
    } catch (error) {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setLastUpdated(new Date());
  };

  const handleRemoveOwner = (id: string) => {
    setOwners(owners.filter(owner => owner.id !== id));
    setLastUpdated(new Date());
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setLastUpdated(new Date());
  };

  return {
    description,
    owners,
    links,
    tags,
    lastUpdated,
    handleAddLink,
    handleAddOwner,
    handleAddTag,
    handleRemoveLink,
    handleRemoveOwner,
    handleRemoveTag,
  };
}
