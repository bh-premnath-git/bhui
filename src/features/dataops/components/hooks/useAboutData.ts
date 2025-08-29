import { useState, useEffect } from 'react';
import { saveDescriptionServ, addLink, addOwner, addTag } from '@/features/data-catalog/components/services/dataService';
import { toast } from 'sonner';
import { Owner, Link, AboutData } from '@/features/data-catalog/types';

export function useAboutData(initialData: AboutData) {
  const [description, setDescription] = useState<string>('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update state when initialData changes
  useEffect(() => {
    setDescription(initialData.description || '');
    setOwners(initialData.owners || []);
    setLinks(initialData.links || []);
    setTags(initialData.tags || []);
  }, [initialData]);

  const handleSaveDescription = async (id: number, description: string) => {
    try {
      await saveDescriptionServ(id, description);
      setDescription(description);
      setLastUpdated(new Date());
      toast.success('Description saved successfully');
    } catch (error) {
      toast.error('Failed to save description');
    }
  };

  const handleAddLink = async (newLink: Link) => {
    try {
      await addLink(newLink);
      setLinks(prevLinks => [...prevLinks, newLink]);
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
      setOwners(prevOwners => [...prevOwners, owner]);
      setLastUpdated(new Date());
      toast.success('Owner added successfully');
    } catch (error) {
      toast.error('Failed to add owner');
    }
  };

  const handleAddTag = async (newTag: string) => {
    try {
      await addTag(newTag);
      setTags(prevTags => [...prevTags, newTag]);
      setLastUpdated(new Date());
      toast.success('Tag added successfully');
    } catch (error) {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prevLinks => prevLinks.filter((_, i) => i !== index));
    setLastUpdated(new Date());
  };

  const handleRemoveOwner = (id: string) => {
    setOwners(prevOwners => prevOwners.filter(owner => owner.id !== id));
    setLastUpdated(new Date());
  };

  const handleRemoveTag = (index: number) => {
    setTags(prevTags => prevTags.filter((_, i) => i !== index));
    setLastUpdated(new Date());
  };

  return {
    description,
    owners,
    links,
    tags,
    lastUpdated,
    handleSaveDescription,
    handleAddLink,
    handleAddOwner,
    handleAddTag,
    handleRemoveLink,
    handleRemoveOwner,
    handleRemoveTag,
  };
}
