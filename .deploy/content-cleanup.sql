update news set slug = 'world-showcase-media-update' where id = 36;
update homepage_features
set href = '/news/core-system-update-brief'
where _order = 1 and _parent_id in (select id from homepage limit 1);